const today: Date = new Date();

const months = {
  "1": "January",
  "2": "February",
  "3": "March",
  "4": "April",
  "5": "May",
  "6": "June",
  "7": "July",
  "8": "August",
  "9": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

const year: number = today.getFullYear();
const month: number = today.getMonth() + 1;
const day: number = today.getDate();
const time: number = today.getTime();
const hours = today.getHours().toString().padStart(2, "0");
const minutes = today.getMinutes().toString().padStart(2, "0");
const seconds = today.getSeconds().toString().padStart(2, "0");
const milliseconds = today.getMilliseconds().toString().padStart(3, "0");

export function getFullDate(): string {
  return `${day}`;
}

export function getFullMonth(): string {
  //@ts-ignore
  return `${months[month]}`;
}

export function getFullYear(): string {
  return `${year}`;
}

export function getDate(): string {
  return `${day}`;
}

export function getTime(): string {
  return `${hours}-${minutes}-${seconds}-${milliseconds}`;
}
