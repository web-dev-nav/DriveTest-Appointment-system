

// Function to generate time slots from start time to end time with a specified interval
function generateTimeSlots(startTime, endTime, interval) {
    const timeSlots = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
  
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minutes = 0; minutes < 60; minutes += interval) {
        if (hour === endHour && minutes > endMinute) {
          break; // Stop when exceeding the end time
        }
  
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const time = `${formattedHour}:${formattedMinutes}`;
        timeSlots.push(time);
      }
    }
  
  
    return timeSlots;
  }
  
  module.exports = {
    generateTimeSlots,
  };