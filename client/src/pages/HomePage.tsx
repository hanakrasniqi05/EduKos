import HeroHeader from "../sections/HeroHeader";
import HomeStats from "../sections/HomeStats"

const HomePage = () => {
  return (
    <main className="min-h-screen">
      <HeroHeader />
      <HomeStats />
    </main>
  );
};

export default HomePage;