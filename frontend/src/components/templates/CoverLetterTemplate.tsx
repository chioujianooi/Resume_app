import type { CoverLetterData } from '@resume-app/shared';
import { COVER_LETTER_LABELS } from '../../utils/templateLabels';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');

.cover-letter-page {
  width: 210mm;
  min-height: 297mm;
  padding: 22mm 24mm;
  font-family: "Lato", sans-serif;
  font-size: 10.5pt;
  line-height: 1.55;
  color: #1a1a1a;
  box-sizing: border-box;
}

.cover-letter-header {
  margin-bottom: 18mm;
}

.cover-letter-header-name {
  font-size: 18pt;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.cover-letter-header-contact {
  font-size: 9.5pt;
  color: #555;
}

.cover-letter-header-contact a {
  color: #555;
  text-decoration: none;
}

.cover-letter-subject {
  font-weight: 700;
  margin: 10mm 0 6mm;
}

.cover-letter-paragraph {
  margin-bottom: 5mm;
}

.cover-letter-paragraph p {
  margin: 0 0 5mm 0;
}
`;

interface Props {
  coverLetter: CoverLetterData;
}

export default function CoverLetterTemplate({ coverLetter }: Props) {
  const { contact, date, targetJob, targetCompany, opening, body, closing } = coverLetter;
  const L = COVER_LETTER_LABELS[coverLetter.language ?? 'en'];

  const contactParts = [contact.email, contact.phone, contact.location].filter(Boolean);

  return (
    <div className="cover-letter-page">
      <style>{CSS}</style>

      <div className="cover-letter-header">
        <div className="cover-letter-header-name">{contact.name}</div>
        <div className="cover-letter-header-contact">
          {contactParts.join(' | ')}
          {contact.links && contact.links.length > 0 && (
            <>
              {contactParts.length > 0 ? ' | ' : ''}
              {contact.links.map((link, i) => (
                <span key={i}>
                  {i > 0 ? ' | ' : ''}
                  <a href={link.url}>{link.label}</a>
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="cover-letter-paragraph">{date}</div>

      <div className="cover-letter-subject">
        {L.subject} {targetJob || L.positionPlaceholder} {L.at} {targetCompany || L.companyPlaceholder}
      </div>

      <div
        className="cover-letter-paragraph"
        dangerouslySetInnerHTML={{ __html: opening }}
      />
      <div
        className="cover-letter-paragraph"
        dangerouslySetInnerHTML={{ __html: body }}
      />
      <div
        className="cover-letter-paragraph"
        dangerouslySetInnerHTML={{ __html: closing }}
      />
    </div>
  );
}
