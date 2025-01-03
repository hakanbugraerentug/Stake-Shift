import LogoImage from "../assets/solanabeach.png";

export default function Logo() {
    return (
        <div className="flex items-center">
            <img src={LogoImage} alt="Solana Beach Logo" className="w-10 h-10" />
            <span className="text-2xl font-bold">Solana Beach</span>
        </div>
    )
}