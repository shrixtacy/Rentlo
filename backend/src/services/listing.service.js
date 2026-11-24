import Listing from '../models/listing.model.js';

export const createListing = async (ownerId, data, imageUrls) => {
  const listing = await Listing.create({
    ...data,
    owner: ownerId,
    images: imageUrls,
    status: 'AVAILABLE',
  });
  return listing;
};

export const searchListings = async ({
  category,
  q,
  minPrice,
  maxPrice,
  lat,
  lng,
  radius = 10000,
  sort = 'createdAt',
  page = 1,
  limit = 20,
} = {}) => {
  const query = { status: 'AVAILABLE' };

  if (lat && lng) {
    query.location = {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(radius),
      },
    };
  }

  if (category) {
    query.category = category;
  }

  if (q) {
    query.$text = { $search: q };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.pricePerDay = {};
    if (minPrice !== undefined) query.pricePerDay.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined) query.pricePerDay.$lte = parseFloat(maxPrice);
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [listings, total] = await Promise.all([
    Listing.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
    Listing.countDocuments(query),
  ]);

  return {
    listings,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
  };
};

export const getListingById = async (id) => {
  const listing = await Listing.findById(id).populate('owner', 'name avatar avgRating');
  if (!listing) {
    const err = new Error('Listing not found');
    err.statusCode = 404;
    throw err;
  }
  return listing;
};

export const updateListing = async (id, ownerId, updates) => {
  const listing = await Listing.findOneAndUpdate(
    { _id: id, owner: ownerId },
    updates,
    { new: true, runValidators: true }
  );
  if (!listing) {
    const err = new Error('Listing not found or not authorized');
    err.statusCode = 404;
    throw err;
  }
  return listing;
};

export const deleteListing = async (id, ownerId) => {
  const listing = await Listing.findOneAndUpdate(
    { _id: id, owner: ownerId },
    { status: 'DELETED' },
    { new: true }
  );
  if (!listing) {
    const err = new Error('Listing not found or not authorized');
    err.statusCode = 404;
    throw err;
  }
  return listing;
};

export const checkAvailability = async (id, startDate, endDate) => {
  const listing = await Listing.findById(id);
  if (!listing) {
    const err = new Error('Listing not found');
    err.statusCode = 404;
    throw err;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const blockedTimes = listing.blockedDates.map((d) => new Date(d).getTime());
  const rangeMs = end.getTime() - start.getTime();
  const totalDays = Math.ceil(rangeMs / (1000 * 60 * 60 * 24));

  let available = true;
  for (let i = 0; i < totalDays; i++) {
    const day = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    if (blockedTimes.includes(day.getTime())) {
      available = false;
      break;
    }
  }

  const rentalFee = totalDays * listing.pricePerDay;
  const serviceFee = rentalFee * 0.05;
  const securityDeposit = listing.securityDeposit;
  const totalAmount = rentalFee + securityDeposit + serviceFee;

  return {
    available,
    breakdown: {
      totalDays,
      rentalFee,
      serviceFee,
      securityDeposit,
      totalAmount,
    },
  };
};
