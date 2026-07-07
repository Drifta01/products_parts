import Image from "next/image";

export default function Home() {
  return (
    <div className="fixed">
      <div className="text-center">
        <Image src="/uploads/CC_Logo.jpg" alt="Logo" width={450} height={250} />
        <h1 className="text-4xl font-bold mt-4"></h1>
      </div>
    </div>
  );
}
