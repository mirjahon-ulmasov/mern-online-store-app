function add(x) {
  const five = 5;
  return function to(y) {
    return five * (x + y);
  };
}

const add10 = add(10);
const to2 = add10(2);
const to5 = add10(5);

console.log(to2); // 12 * 5 = 60
console.log(to5); // 15 * 5 = 75
console.log(add10(10)); // 20 * 5 = 100
console.log(add(20)(20)); // 40 * 5 = 200
