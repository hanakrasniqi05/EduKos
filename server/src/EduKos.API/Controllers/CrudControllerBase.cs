using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EduKos.API.Controllers;

[ApiController]
[Authorize]
public abstract class CrudControllerBase<TEntity, TDto> : ControllerBase
    where TEntity : class, new()
    where TDto : class, new()
{
    protected readonly EduKos.Infrastructure.Persistence.AppDbContext Context;

    protected CrudControllerBase(EduKos.Infrastructure.Persistence.AppDbContext context)
    {
        Context = context;
    }

    protected abstract DbSet<TEntity> Set { get; }
    protected abstract int GetId(TEntity entity);
    protected abstract void SetId(TEntity entity, int id);

    [HttpGet]
    [AllowAnonymous]
    public virtual async Task<ActionResult<IEnumerable<TDto>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await Set.AsNoTracking().ToListAsync(cancellationToken);
        return Ok(items.Select(MapToDto));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public virtual async Task<ActionResult<TDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var entity = await Set.FindAsync([id], cancellationToken);
        return entity == null ? NotFound() : Ok(MapToDto(entity));
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Shkolla")]
    public virtual async Task<ActionResult<TDto>> Create([FromBody] TDto dto, CancellationToken cancellationToken)
    {
        var entity = MapToEntity(dto);
        SetId(entity, 0);
        await Set.AddAsync(entity, cancellationToken);
        await Context.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = GetId(entity) }, MapToDto(entity));
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Shkolla")]
    public virtual async Task<IActionResult> Update(int id, [FromBody] TDto dto, CancellationToken cancellationToken)
    {
        var entity = await Set.FindAsync([id], cancellationToken);
        if (entity == null)
            return NotFound();

        Copy(dto, entity);
        SetId(entity, id);
        await Context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public virtual async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var entity = await Set.FindAsync([id], cancellationToken);
        if (entity == null)
            return NotFound();

        Set.Remove(entity);
        await Context.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    protected static TDto MapToDto(TEntity entity)
    {
        var dto = new TDto();
        Copy(entity, dto);
        return dto;
    }

    protected static TEntity MapToEntity(TDto dto)
    {
        var entity = new TEntity();
        Copy(dto, entity);
        return entity;
    }

    public static void Copy<TSource, TTarget>(TSource source, TTarget target)
    {
        var targetProperties = typeof(TTarget).GetProperties()
            .Where(x => x.CanWrite)
            .ToDictionary(x => x.Name);

        foreach (var sourceProperty in typeof(TSource).GetProperties().Where(x => x.CanRead))
        {
            if (!targetProperties.TryGetValue(sourceProperty.Name, out var targetProperty))
                continue;

            if (!targetProperty.PropertyType.IsAssignableFrom(sourceProperty.PropertyType))
                continue;

            targetProperty.SetValue(target, sourceProperty.GetValue(source));
        }
    }
}
