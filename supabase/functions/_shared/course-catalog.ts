export type CertificateCourse = {
  key: string;
  name: string;
};

const COURSES: Record<string, CertificateCourse> = Object.freeze({
  ctfl: {
    key: 'ctfl',
    name: 'ISTQB® Certified Tester Foundation Level 4.0 (CTFL)'
  },
  ctai: {
    key: 'ctai',
    name: 'ISTQB® Certificado en Pruebas de IA v2.0 (CT-AI)'
  },
  'ct-genai': {
    key: 'ct-genai',
    name: 'ISTQB® Certified Tester - Testing with Generative AI (CT-GenAI)'
  },
  'scrum-master': {
    key: 'scrum-master',
    name: 'Scrum Master basado en la Scrum Guide 2020'
  },
  'scrum-product-owner': {
    key: 'scrum-product-owner',
    name: 'Scrum Product Owner Professional Certification'
  },
  'project-management-essentials': {
    key: 'project-management-essentials',
    name: 'Project Management Essentials'
  },
  'scrum-fundamentals': {
    key: 'scrum-fundamentals',
    name: 'Scrum Fundamentals'
  },
  'cybersecurity-awareness': {
    key: 'cybersecurity-awareness',
    name: 'Cybersecurity Awareness'
  }
});

export function certificateCourse(courseKey: unknown): CertificateCourse | null {
  const key = String(courseKey || '').trim().toLowerCase();
  return COURSES[key] || null;
}
