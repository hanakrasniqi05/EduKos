import HeroHeader from "../sections/HeroHeader";
import HomeStats from "../sections/HomeStats"
import Footer from "../sections/Footer";

const HomePage = () => {
  return (
    <>
      <main className="min-h-screen">
        <HeroHeader />
        <HomeStats />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;