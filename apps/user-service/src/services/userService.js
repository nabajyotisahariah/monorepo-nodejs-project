const users = [
  { id: 1, name: "John", address: "123 Main St" },
  { id: 2, name: "David", address: "456 Oak Ave" },
  { id: 3, name: "Emma", address: "789 Pine Rd" },
  { id: 4, name: "Olivia", address: "24 Cedar Lane" },
  { id: 5, name: "Liam", address: "56 Maple Street" },
  { id: 6, name: "Noah", address: "81 Birch Way" },
  { id: 7, name: "Ava", address: "19 Willow Court" },
  { id: 8, name: "Sophia", address: "203 Lakeview Dr" },
  { id: 9, name: "Mason", address: "42 Hillcrest Ave" },
  { id: 10, name: "Isabella", address: "67 Parkside Blvd" },
  { id: 11, name: "Ethan", address: "315 River Road" },
  { id: 12, name: "Mia", address: "28 Sunset Blvd" },
  { id: 13, name: "Lucas", address: "94 Highland St" },
  { id: 14, name: "Charlotte", address: "17 Orchard Lane" },
  { id: 15, name: "Amir", address: "52 Garden Way" },
  { id: 16, name: "Harper", address: "138 Meadow Dr" },
  { id: 17, name: "Benjamin", address: "73 Forest Ave" },
  { id: 18, name: "Evelyn", address: "206 Brookside Rd" },
  { id: 19, name: "Elijah", address: "39 Valley View" },
  { id: 20, name: "Amelia", address: "115 Coastal Highway" }
];

export function getAllUsers() {
  return users;
}

export function getUserById(id) {
  return users.find((user) => user.id === id);
}
