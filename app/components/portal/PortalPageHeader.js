const variantStyles = {
  internal: 'text-teal',
  designer: 'text-purple',
  client:   'text-teal',
}

export default function PortalPageHeader({ variant, label, title }) {
  const color = variantStyles[variant]
  return (
    <div className="mb-12">
      <p className={`font-mono text-xs ${color} opacity-75 tracking-widest uppercase mb-4`}>
        {label}
      </p>
      <h1 className="text-3xl opacity-80 font-semibold">{title}</h1>
    </div>
  )
}