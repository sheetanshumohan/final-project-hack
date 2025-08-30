const Button = ({ children, variant = "primary", ...props }) => {
  const baseStyles =
    "px-4 py-2 font-semibold rounded-md shadow-sm transition-transform transform hover:scale-105";

  const variants = {
    primary:
      "bg-gradient-to-r from-[var(--mangrove)] to-[var(--sea)] text-[#041018] hover:brightness-110",

    secondary:
      "bg-transparent text-[var(--sea)] ring-1 ring-inset ring-[var(--sea)] hover:bg-[var(--sea)] hover:text-[var(--bg)]",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
