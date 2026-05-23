import SiteHeader from "@/components/Navbar";
import { navFont, sortsMillGoudy } from "./fonts";

export default function Home() {
  return (
    <div className="relative flex h-svh min-w-content flex-col">
      <SiteHeader />
      <main className="relative z-10 mx-auto box-border min-h-0 w-full max-w-content flex-1 overflow-hidden border-b border-solid border-white/5">
        <div className="absolute inset-0 flex flex-col items-center justify-start gap-3 p-10 mt-10 text-center">
        {/*   <h1
            className={`${sortsMillGoudy.className} max-w-4xl text-7xl leading-none tracking-[-0.06em] text-white`}
          >
            The Intelligent <br /> Social Platform
          </h1> */}
          <h1
            className={`${sortsMillGoudy.className} max-w-4xl text-7xl leading-none tracking-[-0.06em] text-white`}
          >
            
          </h1>
          <p
            className={`${navFont.className} text-[16px] tracking-[0.01em] text-white`}
          >
            Helping communities build worldclass <br />
            teams to bring great ideas into existence.
          </p>
        </div>
      </main>
    </div>
  );
}


    {/*  <Image
            src="/templates-_1_.png"
            alt="Pixelated mountain landscape"
            fill
            priority
            className="object-cover object-center"
            sizes="1408px"
          /> */}