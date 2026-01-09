// Utility function to transform backend property data to frontend format

export interface BackendProperty {
  _id: string;
  title: string;
  price: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
  };
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: string;
  status: string;
  favorites?: string[];
  [key: string]: any;
}

export interface FrontendProperty {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  image: string;
  isFavorite: boolean;
  type: string;
}

// Format price number to currency string
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Format area number to string with "sq ft"
const formatArea = (area: number): string => {
  return new Intl.NumberFormat("en-US").format(area) + " sq ft";
};

// Capitalize first letter and format property type
const formatPropertyType = (propertyType: string): string => {
  const typeMap: { [key: string]: string } = {
    house: "House",
    apartment: "Apartment",
    condo: "Condo",
    townhouse: "Townhouse",
    villa: "Villa",
    land: "Land",
    commercial: "Commercial",
  };
  return (
    typeMap[propertyType.toLowerCase()] ||
    propertyType.charAt(0).toUpperCase() + propertyType.slice(1)
  );
};

// Transform backend property to frontend format
export const transformProperty = (
  backendProperty: BackendProperty,
  userId?: string
): FrontendProperty => {
  const isFavorite =
    userId && backendProperty.favorites
      ? backendProperty.favorites.includes(userId)
      : false;

  return {
    id: backendProperty._id.toString(),
    title: backendProperty.title,
    price: formatPrice(backendProperty.price),
    location: `${backendProperty.location.city}, ${backendProperty.location.state}`,
    bedrooms: backendProperty.bedrooms,
    bathrooms: backendProperty.bathrooms,
    area: formatArea(backendProperty.area),
    image:
      backendProperty.images && backendProperty.images.length > 0
        ? backendProperty.images[0]
        : "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", // Default image
    isFavorite,
    type: formatPropertyType(backendProperty.propertyType),
  };
};

// Transform array of backend properties
export const transformProperties = (
  backendProperties: BackendProperty[],
  userId?: string
): FrontendProperty[] => {
  return backendProperties.map((property) =>
    transformProperty(property, userId)
  );
};
