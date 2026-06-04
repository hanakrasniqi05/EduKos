using System.IO.Compression;
using System.Text;
using System.Text.Json;
using System.Xml.Linq;
using Microsoft.AspNetCore.Http;

namespace EduKos.API.Services.DataManagement;

public static class TabularFileService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    public static byte[] WriteJson(IReadOnlyList<Dictionary<string, string?>> rows) =>
        JsonSerializer.SerializeToUtf8Bytes(rows, JsonOptions);

    public static async Task<IReadOnlyList<Dictionary<string, string?>>> ReadJson(IFormFile file, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        var rows = await JsonSerializer.DeserializeAsync<List<Dictionary<string, JsonElement>>>(stream, JsonOptions, cancellationToken);
        return rows?.Select(row => row.ToDictionary(x => x.Key, x => JsonValue(x.Value), StringComparer.OrdinalIgnoreCase)).ToList() ?? [];
    }

    public static byte[] WriteCsv(IReadOnlyList<Dictionary<string, string?>> rows) =>
        Encoding.UTF8.GetBytes(ToCsv(rows));

    public static async Task<IReadOnlyList<Dictionary<string, string?>>> ReadCsv(IFormFile file, CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(file.OpenReadStream(), Encoding.UTF8);
        var content = await reader.ReadToEndAsync(cancellationToken);
        return FromCsv(content);
    }

    public static byte[] WriteExcel(IReadOnlyList<Dictionary<string, string?>> rows, string sheetName)
    {
        var headers = Headers(rows);
        using var stream = new MemoryStream();
        using (var archive = new ZipArchive(stream, ZipArchiveMode.Create, true))
        {
            WriteEntry(archive, "[Content_Types].xml", """
                <?xml version="1.0" encoding="UTF-8"?>
                <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
                  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
                  <Default Extension="xml" ContentType="application/xml"/>
                  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
                  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
                </Types>
                """);
            WriteEntry(archive, "_rels/.rels", """
                <?xml version="1.0" encoding="UTF-8"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
                </Relationships>
                """);
            WriteEntry(archive, "xl/_rels/workbook.xml.rels", """
                <?xml version="1.0" encoding="UTF-8"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
                </Relationships>
                """);
            WriteEntry(archive, "xl/workbook.xml", $$"""
                <?xml version="1.0" encoding="UTF-8"?>
                <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
                  <sheets>
                    <sheet name="{{EscapeXml(sheetName)}}" sheetId="1" r:id="rId1"/>
                  </sheets>
                </workbook>
                """);
            WriteEntry(archive, "xl/worksheets/sheet1.xml", WorksheetXml(headers, rows));
        }

        return stream.ToArray();
    }

    public static async Task<IReadOnlyList<Dictionary<string, string?>>> ReadExcel(IFormFile file, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        using var memory = new MemoryStream();
        await stream.CopyToAsync(memory, cancellationToken);
        return FromExcel(memory.ToArray());
    }

    private static string ToCsv(IReadOnlyList<Dictionary<string, string?>> rows)
    {
        var headers = Headers(rows);
        var builder = new StringBuilder();
        builder.AppendLine(string.Join(",", headers.Select(EscapeCsv)));

        foreach (var row in rows)
            builder.AppendLine(string.Join(",", headers.Select(header => EscapeCsv(row.GetValueOrDefault(header)))));

        return builder.ToString();
    }

    private static IReadOnlyList<Dictionary<string, string?>> FromCsv(string content)
    {
        var lines = ParseCsv(content);
        if (lines.Count == 0) return [];

        var headers = lines[0];
        return lines
            .Skip(1)
            .Where(row => row.Any(value => !string.IsNullOrWhiteSpace(value)))
            .Select(row =>
            {
                var item = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
                for (var i = 0; i < headers.Count; i++)
                    item[headers[i]] = i < row.Count ? row[i] : null;
                return item;
            })
            .ToList();
    }

    private static IReadOnlyList<Dictionary<string, string?>> FromExcel(byte[] bytes)
    {
        using var stream = new MemoryStream(bytes);
        using var archive = new ZipArchive(stream, ZipArchiveMode.Read);
        var sheet = archive.GetEntry("xl/worksheets/sheet1.xml") ?? throw new InvalidOperationException("Worksheet was not found.");
        var sharedStrings = ReadSharedStrings(archive);

        using var reader = new StreamReader(sheet.Open());
        var document = XDocument.Parse(reader.ReadToEnd());
        XNamespace ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";

        var rows = document.Descendants(ns + "row")
            .Select(row => row.Elements(ns + "c").Select(cell => ExcelCellValue(cell, sharedStrings, ns)).ToList())
            .ToList();

        if (rows.Count == 0) return [];

        var headers = rows[0].Select(header => header ?? string.Empty).ToList();
        return rows
            .Skip(1)
            .Where(row => row.Any(value => !string.IsNullOrWhiteSpace(value)))
            .Select(row =>
            {
                var item = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
                for (var i = 0; i < headers.Count; i++)
                    item[headers[i]] = i < row.Count ? row[i] : null;
                return item;
            })
            .ToList();
    }

    private static string WorksheetXml(IReadOnlyList<string> headers, IReadOnlyList<Dictionary<string, string?>> rows)
    {
        var builder = new StringBuilder();
        builder.Append("""<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>""");
        builder.Append("<row>");
        foreach (var header in headers)
            builder.Append(Cell(header));
        builder.Append("</row>");

        foreach (var row in rows)
        {
            builder.Append("<row>");
            foreach (var header in headers)
                builder.Append(Cell(row.GetValueOrDefault(header)));
            builder.Append("</row>");
        }

        builder.Append("</sheetData></worksheet>");
        return builder.ToString();
    }

    private static List<List<string>> ParseCsv(string content)
    {
        var rows = new List<List<string>>();
        var row = new List<string>();
        var value = new StringBuilder();
        var inQuotes = false;

        for (var i = 0; i < content.Length; i++)
        {
            var current = content[i];
            if (current == '"')
            {
                if (inQuotes && i + 1 < content.Length && content[i + 1] == '"')
                {
                    value.Append('"');
                    i++;
                }
                else
                {
                    inQuotes = !inQuotes;
                }
            }
            else if (current == ',' && !inQuotes)
            {
                row.Add(value.ToString());
                value.Clear();
            }
            else if ((current == '\n' || current == '\r') && !inQuotes)
            {
                if (current == '\r' && i + 1 < content.Length && content[i + 1] == '\n')
                    i++;
                row.Add(value.ToString());
                value.Clear();
                rows.Add(row);
                row = [];
            }
            else
            {
                value.Append(current);
            }
        }

        row.Add(value.ToString());
        if (row.Count > 1 || !string.IsNullOrWhiteSpace(row[0]))
            rows.Add(row);

        return rows;
    }

    private static IReadOnlyList<string> Headers(IReadOnlyList<Dictionary<string, string?>> rows) =>
        rows.SelectMany(row => row.Keys).Distinct(StringComparer.OrdinalIgnoreCase).ToList();

    private static string Cell(string? value) =>
        $"<c t=\"inlineStr\"><is><t>{EscapeXml(value ?? string.Empty)}</t></is></c>";

    private static void WriteEntry(ZipArchive archive, string path, string content)
    {
        var entry = archive.CreateEntry(path);
        using var writer = new StreamWriter(entry.Open(), Encoding.UTF8);
        writer.Write(content.Trim());
    }

    private static Dictionary<int, string> ReadSharedStrings(ZipArchive archive)
    {
        var entry = archive.GetEntry("xl/sharedStrings.xml");
        if (entry == null) return [];

        using var reader = new StreamReader(entry.Open());
        var document = XDocument.Parse(reader.ReadToEnd());
        XNamespace ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
        return document.Descendants(ns + "si")
            .Select((item, index) => new { index, value = string.Concat(item.Descendants(ns + "t").Select(x => x.Value)) })
            .ToDictionary(x => x.index, x => x.value);
    }

    private static string? ExcelCellValue(XElement cell, Dictionary<int, string> sharedStrings, XNamespace ns)
    {
        var type = cell.Attribute("t")?.Value;
        if (type == "inlineStr")
            return cell.Descendants(ns + "t").FirstOrDefault()?.Value;

        var value = cell.Element(ns + "v")?.Value;
        if (type == "s" && int.TryParse(value, out var index))
            return sharedStrings.GetValueOrDefault(index);

        return value;
    }

    private static string EscapeCsv(string? value)
    {
        value ??= string.Empty;
        return value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r')
            ? $"\"{value.Replace("\"", "\"\"")}\""
            : value;
    }

    private static string EscapeXml(string value) =>
        value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;").Replace("\"", "&quot;");

    private static string? JsonValue(JsonElement value) =>
        value.ValueKind switch
        {
            JsonValueKind.Null => null,
            JsonValueKind.String => value.GetString(),
            JsonValueKind.Number => value.ToString(),
            JsonValueKind.True => "true",
            JsonValueKind.False => "false",
            _ => value.GetRawText()
        };
}
