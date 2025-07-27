// Liste des villes
export const CITIES = ['Nantes', 'Brest', 'Caen', 'Rennes', 'Paris'];

export function getCampusName(campusId: number): (typeof CITIES)[number] {
  switch (campusId) {
    case 1:
      return 'Nantes';
    case 2:
      return 'Brest';
    case 3:
      return 'Caen';
    case 4:
      return 'Rennes';
    case 5:
      return 'Paris';
    default:
      return 'Nantes';
  }
}
