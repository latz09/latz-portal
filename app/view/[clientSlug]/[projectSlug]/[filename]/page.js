import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_PROJECT_QUERY as Q } from '@/app/data/queries/pages/FETCH_PROJECT_QUERY';
import PrintButton from '@/app/utils/cms/PrintButton';

export default async function ViewerPage({ params, searchParams }) {
  const { clientSlug, projectSlug, filename } = await params;
  const { ref } = await searchParams;
  const data = await f(Q, { clientSlug, projectSlug });
  const { name: clientName, project } = data;

  const src = `/clients/${clientSlug}/${projectSlug}/${filename}`;

  const backHref = ref === 'internal'
    ? `/clients/${clientSlug}/${projectSlug}`
    : ref === 'designer'
    ? `/portal/designer/${clientSlug}/${projectSlug}`
    : null;

  return (
    <div className='fixed inset-0 flex flex-col w-full'>
      {/* Top bar */}
      <div className='flex items-center justify-between w-full px-4 lg:px-6 h-12 shrink-0 bg-dark/90 backdrop-blur border-b border-b-teal'>
        {backHref ? (
          <a
            href={backHref}
            className='font-mono text-xs text-white/40 hover:text-white tracking-widest uppercase transition-colors'
          >
            ← Back
          </a>
        ) : (
          <span className='font-mono text-xs text-white/40 tracking-widest uppercase'>
            Latz Web Design
          </span>
        )}
        <span className='hidden sm:block font-mono text-xs text-white/70 tracking-widest uppercase'>
          {clientName} — {project.name}
        </span>
        <PrintButton />
      </div>

      {/* Iframe */}
      <iframe src={src} className='flex-1 w-full border-none' />
    </div>
  );
}