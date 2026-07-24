const variantStyles = {
  internal: 'text-teal',
  designer: 'text-purple',
  client:   'text-teal',
}

export default function PortalPageHeader({ variant, label, title }) {
  const color = variantStyles[variant]
  return (
 <div className='mb-8'>
				<p className='font-mono text-[11px] tracking-widest uppercase text-purple/70 mb-2'>
					Alyssa Shurbert-Hetzel
				</p>
				<h1 className='text-2xl lg:text-3xl font-semibold text-white'>
					Your Active Projects
				</h1>
			</div>
  )
}