export function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

export function getDurationInMinutes(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / 60_000;
}

export function getDurationFormatted(start: Date, end: Date): { heures: string, minutes: string } {
    const diff = end.getTime() - start.getTime();

    const totalMinutes = Math.floor(diff / 60_000);
    const heures = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return { heures: heures.toString(), minutes: minutes.toString().padStart(2, '0') };
}

export function dateToNaturalLanguage(date: Date): string {
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}