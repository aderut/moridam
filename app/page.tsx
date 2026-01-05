import Hero from "@/app/components/Hero";
import AboutSplit from "@/app/components/AboutSplit";
import BlogPreview from "@/app/components/BlogPreview";
import BrowseMenuCards from "@/app/components/BrowseMenuCards";
import Footer from "@/app/components/Footer";
import ServicesGrid from "@/app/components/ServicesGrid";

export default function Home() {
    return (
        <>
            <main>
                <Hero />
                <BrowseMenuCards />
                <AboutSplit/>
                <ServicesGrid/>
                <BlogPreview/>

            </main>

        </>
    );
}
