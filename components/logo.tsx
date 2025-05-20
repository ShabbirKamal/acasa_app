import Link from "next/link"

interface LogoProps {
  size?: "small" | "medium" | "large"
  linkTo?: string
}

export function Logo({ size = "medium", linkTo }: LogoProps) {
  const sizeClasses = {
    small: "text-xl",
    medium: "text-2xl md:text-3xl",
    large: "text-3xl md:text-4xl lg:text-5xl",
  }

  const renderLogo = () => <h1 className={`font-bold ${sizeClasses[size]} tracking-tight text-acasa-blue`}>ACASA</h1>

  if (linkTo) {
    return (
      <Link href={linkTo} className="no-underline hover:no-underline">
        {renderLogo()}
      </Link>
    )
  }

  return renderLogo()
}

