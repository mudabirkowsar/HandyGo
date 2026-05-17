export const singleProviders = [
  {
    _id: "1",
    fullName: "Rajesh Kumar",
    phone: "+919876543210",
    email: "rajesh.fixit@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    serviceCategory: "Plumber",
    experience: 8,
    isVerified: true,
    verificationStatus: "approved",
    aadhaarNumber: "[Aadhaar Redacted]",
    panNumber: "ABCDE1234F",
    location: { type: "Point", coordinates: [76.6785, 30.7333] }, // Mohali
    averageRating: 4.8,
    totalReviews: 3,
    services: [
      { title: "Pipe Leakage Repair", price: 299, priceType: "fixed", estimatedDuration: "45 mins" },
      { title: "Full Bathroom Fitting", price: 2500, priceType: "fixed", estimatedDuration: "5 hours" }
    ],
    reviews: [
      { userName: "Aman Deep", rating: 5, comment: "Very professional and fixed the leak quickly.", date: new Date("2024-03-01") },
      { userName: "Sonia Gill", rating: 4, comment: "Good work but arrived 10 minutes late.", date: new Date("2024-03-05") },
      { userName: "Vikram Singh", rating: 5, comment: "Best plumber in Mohali. Highly recommended.", date: new Date("2024-03-10") }
    ],
    password: "hashed_password_here"
  },
  {
    _id: "2",
    fullName: "Amit Sharma",
    phone: "+919988776655",
    email: "amit.elec@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/2.jpg",
    serviceCategory: "Electrician",
    experience: 5,
    isVerified: true,
    verificationStatus: "approved",
    aadhaarNumber: "[Aadhaar Redacted]",
    panNumber: "FGHIJ5678K",
    location: { type: "Point", coordinates: [76.7794, 30.7333] }, // Chandigarh
    averageRating: 4.9,
    totalReviews: 3,
    services: [
      { title: "Fan Installation", price: 150, priceType: "fixed", estimatedDuration: "20 mins" },
      { title: "House Wiring", price: 800, priceType: "hourly", estimatedDuration: "Varies" }
    ],
    reviews: [
      { userName: "Rahul V.", rating: 5, comment: "Explained the issue clearly. Efficient.", date: new Date("2024-02-15") },
      { userName: "Priya K.", rating: 5, comment: "Very polite and skilled.", date: new Date("2024-02-20") },
      { userName: "Suresh M.", rating: 4, comment: "Decent work.", date: new Date("2024-02-25") }
    ],
    password: "hashed_password_here"
  },
  {
    _id: "3",
    fullName: "Sukhwinder Singh",
    phone: "+919001122334",
    email: "sukhi.ac@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
    serviceCategory: "AC Repair",
    experience: 10,
    isVerified: true,
    verificationStatus: "approved",
    aadhaarNumber: "[Aadhaar Redacted]",
    panNumber: "KLMNO9012P",
    location: { type: "Point", coordinates: [76.6543, 30.7046] }, // Kharar
    averageRating: 4.7,
    totalReviews: 3,
    services: [
      { title: "AC Gas Charging", price: 2500, priceType: "fixed", estimatedDuration: "1 hour" },
      { title: "Filter Cleaning", price: 499, priceType: "fixed", estimatedDuration: "30 mins" }
    ],
    reviews: [
      { userName: "Inder J.", rating: 5, comment: "AC is cooling like new again!", date: new Date("2024-04-01") },
      { userName: "Mehak P.", rating: 4, comment: "Professional service.", date: new Date("2024-04-05") },
      { userName: "Deepak R.", rating: 5, comment: "Saved me from the heat. Great guy.", date: new Date("2024-04-08") }
    ],
    password: "hashed_password_here"
  },
  {
    _id: "4",
    fullName: "Karan Malhotra",
    phone: "+918877665544",
    email: "karan.paint@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/4.jpg",
    serviceCategory: "Painter",
    experience: 7,
    isVerified: true,
    verificationStatus: "approved",
    aadhaarNumber: "[Aadhaar Redacted]",
    panNumber: "PQRST3456L",
    location: { type: "Point", coordinates: [76.6900, 30.7100] },
    averageRating: 4.6,
    totalReviews: 3,
    services: [
      { title: "Single Room Paint", price: 4000, priceType: "fixed", estimatedDuration: "2 days" },
      { title: "Texture Wall", price: 1500, priceType: "fixed", estimatedDuration: "4 hours" }
    ],
    reviews: [
      { userName: "Gaurav T.", rating: 5, comment: "Finish was excellent.", date: new Date("2024-01-10") },
      { userName: "Anita S.", rating: 4, comment: "Good cleanup after the job.", date: new Date("2024-01-15") },
      { userName: "Rohan D.", rating: 5, comment: "Transformed my living room.", date: new Date("2024-01-20") }
    ],
    password: "hashed_password_here"
  },
  {
    _id: "5",
    fullName: "Manoj Yadav",
    phone: "+917766554433",
    email: "manoj.carp@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
    serviceCategory: "Carpenter",
    experience: 12,
    isVerified: true,
    verificationStatus: "approved",
    aadhaarNumber: "[Aadhaar Redacted]",
    panNumber: "UVWXY7890M",
    location: { type: "Point", coordinates: [76.7000, 30.7400] },
    averageRating: 5.0,
    totalReviews: 3,
    services: [
      { title: "Door Repair", price: 350, priceType: "fixed", estimatedDuration: "1 hour" },
      { title: "Furniture Assembly", price: 800, priceType: "hourly", estimatedDuration: "Varies" }
    ],
    reviews: [
      { userName: "Sunny B.", rating: 5, comment: "Expert craftsmanship.", date: new Date("2024-03-20") },
      { userName: "Preeti L.", rating: 5, comment: "Very fast and clean work.", date: new Date("2024-03-22") },
      { userName: "Kabir H.", rating: 5, comment: "Highly recommended for woodwork.", date: new Date("2024-03-25") }
    ],
    password: "hashed_password_here"
  },
  {
    _id: "6",
    fullName: "Sunita Verma",
    phone: "+919112233445",
    email: "sunita.salon@example.com",
    profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
    serviceCategory: "Salon",
    experience: 6,
    isVerified: true,
    verificationStatus: "approved",
    aadhaarNumber: "[Aadhaar Redacted]",
    panNumber: "ZABCD1234N",
    location: { type: "Point", coordinates: [76.7200, 30.7500] },
    averageRating: 4.8,
    totalReviews: 3,
    services: [
      { title: "Hair Cut", price: 250, priceType: "fixed", estimatedDuration: "30 mins" },
      { title: "Facial", price: 1200, priceType: "fixed", estimatedDuration: "1 hour" }
    ],
    reviews: [
      { userName: "Ritika M.", rating: 5, comment: "Very relaxing service at home.", date: new Date("2024-02-01") },
      { userName: "Anjali P.", rating: 4, comment: "Great hygiene maintained.", date: new Date("2024-02-05") },
      { userName: "Simran K.", rating: 5, comment: "Salon like results at my doorstep.", date: new Date("2024-02-10") }
    ],
    password: "hashed_password_here"
  },
  {
    _id: "7",
    fullName: "Gurmeet Singh",
    phone: "+918001122334",
    email: "gurmeet.mech@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/7.jpg",
    serviceCategory: "Mechanic",
    experience: 9,
    isVerified: true,
    verificationStatus: "approved",
    aadhaarNumber: "[Aadhaar Redacted]",
    panNumber: "EFGHI5678Q",
    location: { type: "Point", coordinates: [76.6500, 30.7200] },
    averageRating: 4.5,
    totalReviews: 3,
    services: [
      { title: "Brake Pad Change", price: 600, priceType: "fixed", estimatedDuration: "1 hour" },
      { title: "Oil Change", price: 300, priceType: "fixed", estimatedDuration: "30 mins" }
    ],
    reviews: [
      { userName: "Manish Z.", rating: 4, comment: "Knows his engines.", date: new Date("2024-03-12") },
      { userName: "Arjun W.", rating: 5, comment: "Reliable roadside assistance.", date: new Date("2024-03-15") },
      { userName: "Taran S.", rating: 4, comment: "Good service.", date: new Date("2024-03-18") }
    ],
    password: "hashed_password_here"
  },
  {
    _id: "8",
    fullName: "Pooja Rani",
    phone: "+917001122334",
    email: "pooja.clean@example.com",
    serviceCategory: "Cleaner",
    experience: 4,
    isVerified: true,
    verificationStatus: "approved",
    aadhaarNumber: "[Aadhaar Redacted]",
    panNumber: "IJKLM9012R",
    location: { type: "Point", coordinates: [76.7300, 30.7600] },
    averageRating: 4.9,
    totalReviews: 3,
    services: [
      { title: "Deep Kitchen Cleaning", price: 1500, priceType: "fixed", estimatedDuration: "3 hours" },
      { title: "Full House Cleaning", price: 4000, priceType: "fixed", estimatedDuration: "6 hours" }
    ],
    reviews: [
      { userName: "Neha B.", rating: 5, comment: "My kitchen is sparkling!", date: new Date("2024-04-02") },
      { userName: "Varun J.", rating: 5, comment: "Top notch cleaning service.", date: new Date("2024-04-05") },
      { userName: "Kavita G.", rating: 4, comment: "Thorough work.", date: new Date("2024-04-10") }
    ],
    password: "hashed_password_here"
  },
  {
    _id: "9",
    fullName: "Harpreet Brar",
    phone: "+916001122334",
    email: "harpreet.elec@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/8.jpg",
    serviceCategory: "Electrician",
    experience: 6,
    isVerified: true,
    verificationStatus: "approved",
    aadhaarNumber: "[Aadhaar Redacted]",
    panNumber: "NOPQR3456S",
    location: { type: "Point", coordinates: [76.6600, 30.7000] },
    averageRating: 4.7,
    totalReviews: 3,
    services: [
      { title: "MCB Replacement", price: 450, priceType: "fixed", estimatedDuration: "30 mins" },
      { title: "Inverter Repair", price: 800, priceType: "fixed", estimatedDuration: "1.5 hours" }
    ],
    reviews: [
      { userName: "Sahil K.", rating: 5, comment: "Very technical and helpful.", date: new Date("2024-03-05") },
      { userName: "Babita F.", rating: 4, comment: "Good knowledge of wiring.", date: new Date("2024-03-08") },
      { userName: "Navjot S.", rating: 5, comment: "Fixed my inverter problem quickly.", date: new Date("2024-03-12") }
    ],
    password: "hashed_password_here"
  },
  {
    _id: "10",
    fullName: "Vikas Kohli",
    phone: "+915001122334",
    email: "vikas.ac@example.com",
    profileImage: "https://randomuser.me/api/portraits/men/9.jpg",
    serviceCategory: "AC Repair",
    experience: 7,
    isVerified: true,
    verificationStatus: "approved",
    aadhaarNumber: "[Aadhaar Redacted]",
    panNumber: "STUVW7890T",
    location: { type: "Point", coordinates: [76.7100, 30.7100] },
    averageRating: 4.8,
    totalReviews: 3,
    services: [
      { title: "Split AC Service", price: 599, priceType: "fixed", estimatedDuration: "45 mins" },
      { title: "Leakage Fixing", price: 1200, priceType: "fixed", estimatedDuration: "2 hours" }
    ],
    reviews: [
      { userName: "Rakesh Q.", rating: 5, comment: "Best AC service I've had.", date: new Date("2024-04-05") },
      { userName: "Divya W.", rating: 5, comment: "Reliable and honest technician.", date: new Date("2024-04-10") },
      { userName: "Zoya E.", rating: 4, comment: "Bit expensive but worth the quality.", date: new Date("2024-04-15") }
    ],
    password: "hashed_password_here"
  }
];