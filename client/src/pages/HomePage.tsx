import HeroHeader from "../sections/HeroHeader";
import HomeStats from "../sections/HomeStats"
import Footer from "../sections/Footer";
import HomeSections from "../sections/HomeSections";

const HomePage = () => {
  return (
    <>
      <main className="min-h-screen">
        <HeroHeader />
        <HomeStats />
        <HomeSections />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;