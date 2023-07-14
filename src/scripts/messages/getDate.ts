let currentDate: string

function getDate() {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minutes = date.getMinutes();

    // Dodanie zera przed jednocyfrowymi liczbami
    let formattedDay = day < 10 ? `0${day}` : day;
    let formattedMonth = month < 10 ? `0${month}` : month;
    let formattedHour = hour < 10 ? `0${hour}` : hour;
    let formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    currentDate = `${formattedDay}.${formattedMonth}.${year} ${formattedHour}:${formattedMinutes}`;
}
