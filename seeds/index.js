const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect("mongodb+srv://AK30195:g4QBDAjxQzyZQ3eG@cluster0.vhs4pqo.mongodb"
   + ".net/campview?retryWrites=true&w=majority&appName=Cluster0");

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const sampleImages = [
  {
    url: 'https://res.cloudinary.com/dfmhofkkc/image/upload/v1750949868/CampView/sudlhwrsmutryfj0jynx.jpg',
    filename: 'CampView/sudlhwrsmutryfj0jynx'
  },
  {
    url: 'https://res.cloudinary.com/dfmhofkkc/image/upload/v1750922832/CampView/wj2p8ll5omexvpxagmul.jpg',
    filename: 'CampView/wj2p8ll5omexvpxagmul'
  },
  {
    url: 'https://res.cloudinary.com/dfmhofkkc/image/upload/v1752004996/photo-1471115853179-bb1d604434e0_srqguf.jpg',
    filename: 'photo-1471115853179-bb1d604434e0_srqguf'
  },
  {
    url: 'https://res.cloudinary.com/dfmhofkkc/image/upload/v1752005094/photo-1751255835921-b87eb4ff1c96_nndzhk.jpg',
    filename: 'photo-1751255835921-b87eb4ff1c96_nndzhk'
  },
  {
    url: 'https://res.cloudinary.com/dfmhofkkc/image/upload/v1752005181/photo-1625834509314-3b12c6153624_hhyglt.jpg',
    filename: 'photo-1625834509314-3b12c6153624_hhyglt'
  },
  {
    url: 'https://res.cloudinary.com/dfmhofkkc/image/upload/v1752005207/photo-1537225228614-56cc3556d7ed_ixxh3m.jpg',
    filename: 'photo-1537225228614-56cc3556d7ed_ixxh3m'
  },
  {
    url: 'https://res.cloudinary.com/dfmhofkkc/image/upload/v1752005227/photo-1602391833977-358a52198938_tzq7od.jpg',
    filename: 'photo-1602391833977-358a52198938_tzq7od'
  },
  {
    url: 'https://res.cloudinary.com/dfmhofkkc/image/upload/v1752005251/photo-1455763916899-e8b50eca9967_mdqhtu.jpg',
    filename: 'photo-1455763916899-e8b50eca9967_mdqhtu'
  },
  {
    url: 'https://res.cloudinary.com/dfmhofkkc/image/upload/v1752005273/photo-1476041800959-2f6bb412c8ce_qt4uq1.jpg',
    filename: 'photo-1476041800959-2f6bb412c8ce_qt4uq1'
  },
  {
    url: 'https://res.cloudinary.com/dfmhofkkc/image/upload/v1752005290/photo-1445308394109-4ec2920981b1_sbo2z8.jpg',
    filename: 'photo-1445308394109-4ec2920981b1_sbo2z8'
  },{
    url: 'https://res.cloudinary.com/dfmhofkkc/image/upload/v1752005320/photo-1526491109672-74740652b963_sm5rsc.jpg',
    filename: 'photo-1526491109672-74740652b963_sm5rsc'
  },{
    url: 'https://res.cloudinary.com/dfmhofkkc/image/upload/v1752005336/photo-1520918998343-a33f59b7c079_hkyixl.jpg',
    filename: 'photo-1520918998343-a33f59b7c079_hkyixl'
  }
];

const getRandImage = function(sampleImages) {
  var index = Math.floor(Math.random() * sampleImages.length)
  return sampleImages[index];
};

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const randomPrice = Math.floor(Math.random() * 30) + 10;
        const randomImageOne = getRandImage(sampleImages);
        const randomImageTwo = getRandImage(sampleImages);
        console.log(randomImageOne);
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry:  {
              type: 'Point',
              coordinates: [
                cities[random1000].longitude,
                cities[random1000].latitude
              ]
            },
            title: `${sample(descriptors)} ${sample(places)}`,
            price: randomPrice,
            description: 'Picturesque campsite with all necessary amenities.',
            author: '685295e137594e3cd430fd83',
            images: [
              { 
                url: randomImageOne.url,
                filename: randomImageOne.filename 
              },
              {
                url: randomImageTwo.url,
                filename: randomImageTwo.filename
              }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})