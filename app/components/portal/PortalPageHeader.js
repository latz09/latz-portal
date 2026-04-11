const variantStyles = {
  internal: 'text-teal',
  designer: 'text-purple',
  client:   'text-teal',
}

export default function PortalPageHeader({ variant, label, title }) {
  const color = variantStyles[variant]
  return (
    <div className="mb-12">
     
      <h1 className="text-3xl lg:text-4xl opacity-70 font-semibold">{title}</h1>
       <p className={`font-mono text-xs lg:text-sm ${color} opacity-75 tracking-widest uppercase mt-2 pl-0.5`}>
        {label}
      </p>
    </div>
  )
}