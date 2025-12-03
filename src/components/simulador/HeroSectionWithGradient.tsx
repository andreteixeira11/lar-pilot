interface HeroSectionWithGradientProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
}

const HeroSectionWithGradient = ({
  title,
  subtitle,
  backgroundImage,
}: HeroSectionWithGradientProps) => {
  return (
    <div className="relative h-[300px] md:h-[400px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-wider">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default HeroSectionWithGradient;
