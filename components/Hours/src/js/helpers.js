function IntToDay(i) {
  switch (i % 7) {
    case 0: return "SUNDAY";
    case 1: return "MONDAY";
    case 2: return "TUESDAY";
    case 3: return "WEDNESDAY";
    case 4: return "THURSDAY";
    case 5: return "FRIDAY";
    case 6: return "SATURDAY";
  }
}

function DayToInt(d) {
  switch (d) {
    case "SUNDAY": return 0;
    case "MONDAY": return 1;
    case "TUESDAY": return 2;
    case "WEDNESDAY": return 3;
    case "THURSDAY": return 4;
    case "FRIDAY": return 5;
    case "SATURDAY": return 6;
  }
  throw "[DayToInt]: Invalid Day: " + d;
}

export {
  DayToInt,
  IntToDay
};
