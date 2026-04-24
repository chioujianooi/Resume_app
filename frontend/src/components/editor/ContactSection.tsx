import type { ContactInfo } from '@resume-app/shared';

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
    reader.onload = () => onChange({ ...contact, profilePhoto: reader.result as string });
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
      <Field label="LinkedIn" value={contact.linkedin || ''} onChange={set('linkedin')} placeholder="linkedin.com/in/jane" />
      <Field label="GitHub" value={contact.github || ''} onChange={set('github')} placeholder="github.com/jane" />
      <Field label="Website" value={contact.website || ''} onChange={set('website')} placeholder="janesmith.dev" />

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
