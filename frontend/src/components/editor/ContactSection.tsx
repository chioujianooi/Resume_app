import type { ContactInfo, LinkEntry } from '@resume-app/shared';

interface Props {
  contact: ContactInfo;
  onChange: (c: ContactInfo) => void;
}

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default function ContactSection({ contact, onChange }: Props) {
  const set = (key: keyof ContactInfo) => (v: string) => onChange({ ...contact, [key]: v });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const SIZE = 200; // render at 2× the 100px display size
        const scale = Math.min(1, SIZE / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        onChange({ ...contact, profilePhoto: canvas.toDataURL('image/jpeg', 0.85) });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <Field label="Full Name *" value={contact.name} onChange={set('name')} placeholder="Jane Smith" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Email *" value={contact.email} onChange={set('email')} type="email" placeholder="jane@example.com" />
        <Field label="Phone" value={contact.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
      </div>
      <Field label="Location" value={contact.location} onChange={set('location')} placeholder="San Francisco, CA" />
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-600">Links</label>
        </div>
        {(contact.links ?? []).length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-2 px-1">
            <span className="text-xs text-slate-400">URL</span>
            <span className="text-xs text-slate-400">Label</span>
          </div>
        )}
        <div className="space-y-2">
          {(contact.links ?? []).map((link, i) => {
            const updateLink = (patch: Partial<LinkEntry>) => {
              const links = [...(contact.links ?? [])];
              links[i] = { ...link, ...patch };
              onChange({ ...contact, links });
            };
            const removeLink = () => onChange({ ...contact, links: (contact.links ?? []).filter((_, idx) => idx !== i) });
            return (
              <div key={i} className="flex gap-2 items-center">
                <input
                  value={link.url}
                  onChange={e => updateLink({ url: e.target.value })}
                  placeholder="https://github.com/jane"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  value={link.label}
                  onChange={e => updateLink({ label: e.target.value })}
                  placeholder="GitHub"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={removeLink} className="text-slate-400 hover:text-red-500 text-sm px-1">✕</button>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => onChange({ ...contact, links: [...(contact.links ?? []), { url: '', label: '' }] })}
          className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          + Add link
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Profile Photo <span className="text-slate-400 font-normal">(Modern template only)</span></label>
        <div className="flex items-center gap-3">
          {contact.profilePhoto && (
            <img src={contact.profilePhoto} alt="Profile" className="w-12 h-12 rounded-full object-cover border border-slate-200" />
          )}
          <label className="cursor-pointer px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            {contact.profilePhoto ? 'Change photo' : 'Upload photo'}
            <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
          {contact.profilePhoto && (
            <button
              onClick={() => onChange({ ...contact, profilePhoto: undefined })}
              className="text-sm text-red-500 hover:text-red-700">
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
