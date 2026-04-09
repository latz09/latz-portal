const variantStyles = {
  internal: 'text-teal',
  designer: 'text-purple',
  client:   'text-teal',
}

export default function PortalPageHeader({ variant, label, title }) {
  const color = variantStyles[variant]
  return (
    <div className="mb-12">
      <p className={`font-mono text-xs ${color} tracking-widest uppercase mb-2`}>
        {label}
      </p>
      <h1 className="text-4xl font-semibold">{title}</h1>
    </div>
  )
}