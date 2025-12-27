import Link from "next/link";
import Image from "next/image";

export function HeaderLogo() {
  return (
    <Link href="/" className="flex items-center">
      <div className="item-center hidden lg:flex">
        <Image
          src="/logo.svg"
          alt="Finance Platform Logo"
          width={28}
          height={28}
        />
      </div>
      <p className="text-white font-bold text-xl">Finance Platform</p>
    </Link>
  );
}
export default HeaderLogo;
