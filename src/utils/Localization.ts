interface CurrencyConfig {
    code: string;
    symbol: string;
    locale: string;
}

export const COUNTRY_CURRENCY: Record<string, CurrencyConfig> = {
    'USA': { code: 'USD', symbol: '$', locale: 'en-US' },
    'India': { code: 'INR', symbol: '₹', locale: 'en-IN' },
    'UK': { code: 'GBP', symbol: '£', locale: 'en-GB' },
    'Germany': { code: 'EUR', symbol: '€', locale: 'de-DE' },
    'France': { code: 'EUR', symbol: '€', locale: 'fr-FR' },
    'Singapore': { code: 'SGD', symbol: 'S$', locale: 'en-SG' },
    'UAE': { code: 'AED', symbol: 'د.إ', locale: 'en-AE' },
    'Australia': { code: 'AUD', symbol: 'A$', locale: 'en-AU' },
    'Canada': { code: 'CAD', symbol: 'CA$', locale: 'en-CA' },
    'Japan': { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
    'Brazil': { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
    'Mexico': { code: 'MXN', symbol: 'MX$', locale: 'es-MX' },
    'South Korea': { code: 'KRW', symbol: '₩', locale: 'ko-KR' },
    'China': { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
    'Netherlands': { code: 'EUR', symbol: '€', locale: 'nl-NL' },
    'Sweden': { code: 'SEK', symbol: 'kr', locale: 'sv-SE' },
    'Switzerland': { code: 'CHF', symbol: 'CHF', locale: 'de-CH' },
    'Israel': { code: 'ILS', symbol: '₪', locale: 'he-IL' },
    'Spain': { code: 'EUR', symbol: '€', locale: 'es-ES' },
    'Italy': { code: 'EUR', symbol: '€', locale: 'it-IT' },
    'Indonesia': { code: 'IDR', symbol: 'Rp', locale: 'id-ID' },
    'Nigeria': { code: 'NGN', symbol: '₦', locale: 'en-NG' },
    'South Africa': { code: 'ZAR', symbol: 'R', locale: 'en-ZA' },
    'Kenya': { code: 'KES', symbol: 'KSh', locale: 'en-KE' },
    'Saudi Arabia': { code: 'SAR', symbol: 'ر.س', locale: 'ar-SA' },
    'Turkey': { code: 'TRY', symbol: '₺', locale: 'tr-TR' },
    'Poland': { code: 'PLN', symbol: 'zł', locale: 'pl-PL' },
    'Thailand': { code: 'THB', symbol: '฿', locale: 'th-TH' },
    'Vietnam': { code: 'VND', symbol: '₫', locale: 'vi-VN' },
    'Malaysia': { code: 'MYR', symbol: 'RM', locale: 'ms-MY' },
    'Philippines': { code: 'PHP', symbol: '₱', locale: 'en-PH' },
    'Taiwan': { code: 'TWD', symbol: 'NT$', locale: 'zh-TW' },
    'Hong Kong': { code: 'HKD', symbol: 'HK$', locale: 'en-HK' },
    'New Zealand': { code: 'NZD', symbol: 'NZ$', locale: 'en-NZ' },
    'Ireland': { code: 'EUR', symbol: '€', locale: 'en-IE' },
    'Portugal': { code: 'EUR', symbol: '€', locale: 'pt-PT' },
    'Denmark': { code: 'DKK', symbol: 'kr', locale: 'da-DK' },
    'Norway': { code: 'NOK', symbol: 'kr', locale: 'nb-NO' },
    'Finland': { code: 'EUR', symbol: '€', locale: 'fi-FI' },
    'Belgium': { code: 'EUR', symbol: '€', locale: 'nl-BE' },
    'Austria': { code: 'EUR', symbol: '€', locale: 'de-AT' },
    'Colombia': { code: 'COP', symbol: 'COL$', locale: 'es-CO' },
    'Argentina': { code: 'ARS', symbol: 'AR$', locale: 'es-AR' },
    'Chile': { code: 'CLP', symbol: 'CL$', locale: 'es-CL' },
    'Egypt': { code: 'EGP', symbol: 'E£', locale: 'ar-EG' },
    'Pakistan': { code: 'PKR', symbol: '₨', locale: 'en-PK' },
    'Bangladesh': { code: 'BDT', symbol: '৳', locale: 'bn-BD' },
    'Sri Lanka': { code: 'LKR', symbol: 'Rs', locale: 'en-LK' },
    'Estonia': { code: 'EUR', symbol: '€', locale: 'et-EE' },
    'Latvia': { code: 'EUR', symbol: '€', locale: 'lv-LV' },
    'Lithuania': { code: 'EUR', symbol: '€', locale: 'lt-LT' },
    'Romania': { code: 'RON', symbol: 'lei', locale: 'ro-RO' },
    'Czech Republic': { code: 'CZK', symbol: 'Kč', locale: 'cs-CZ' },
    'Hungary': { code: 'HUF', symbol: 'Ft', locale: 'hu-HU' },
    'Ghana': { code: 'GHS', symbol: 'GH₵', locale: 'en-GH' },
    'Rwanda': { code: 'RWF', symbol: 'RF', locale: 'en-RW' },
    'Qatar': { code: 'QAR', symbol: 'ر.ق', locale: 'ar-QA' },
    'Bahrain': { code: 'BHD', symbol: 'BD', locale: 'ar-BH' },
    'Kuwait': { code: 'KWD', symbol: 'د.ك', locale: 'ar-KW' },
    'Oman': { code: 'OMR', symbol: 'ر.ع.', locale: 'ar-OM' },
    'Jordan': { code: 'JOD', symbol: 'JD', locale: 'ar-JO' },
    'Peru': { code: 'PEN', symbol: 'S/', locale: 'es-PE' },
    'Costa Rica': { code: 'CRC', symbol: '₡', locale: 'es-CR' },
    'Uruguay': { code: 'UYU', symbol: '$U', locale: 'es-UY' },
    'Ukraine': { code: 'UAH', symbol: '₴', locale: 'uk-UA' },
    'Greece': { code: 'EUR', symbol: '€', locale: 'el-GR' },
};

/** Sorted list of all country names */
export const ALL_COUNTRIES = Object.keys(COUNTRY_CURRENCY).sort();

/** Get currency symbol for a country, defaults to $ */
export function getCurrencySymbol(country: string = 'USA'): string {
    return (COUNTRY_CURRENCY[country] || COUNTRY_CURRENCY['USA']).symbol;
}

export function formatCurrency(amount: number, country: string = 'USA'): string {
    const config = COUNTRY_CURRENCY[country] || COUNTRY_CURRENCY['USA'];

    const formatter = new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        maximumFractionDigits: 0,
    });

    return formatter.format(amount);
}

export function formatCurrencyScaled(amount: number, country: string = 'USA'): string {
    const config = COUNTRY_CURRENCY[country] || COUNTRY_CURRENCY['USA'];

    let formatted = '';
    if (config.code === 'INR') {
        if (amount >= 10000000) {
            formatted = `${config.symbol}${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) {
            formatted = `${config.symbol}${(amount / 100000).toFixed(1)}L`;
        } else {
            formatted = `${config.symbol}${(amount / 1000).toFixed(1)}K`;
        }
    } else {
        if (amount >= 1000000000) {
            formatted = `${config.symbol}${(amount / 1000000000).toFixed(1)}B`;
        } else if (amount >= 1000000) {
            formatted = `${config.symbol}${(amount / 1000000).toFixed(1)}M`;
        } else {
            formatted = `${config.symbol}${(amount / 1000).toFixed(1)}K`;
        }
    }
    return formatted;
}

// ── Country → State → City Data ──────────────────────────────────────────────

type StateCities = Record<string, string[]>;

const COUNTRY_STATES_CITIES: Record<string, StateCities> = {
    'India': {
        'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Tirupati', 'Guntur', 'Kakinada'],
        'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'],
        'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba'],
        'Delhi': ['New Delhi', 'Dwarka', 'Rohini', 'Saket'],
        'Goa': ['Panaji', 'Margao', 'Vasco da Gama'],
        'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
        'Haryana': ['Gurugram', 'Faridabad', 'Chandigarh', 'Karnal', 'Panipat'],
        'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Solan'],
        'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
        'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belgaum'],
        'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
        'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
        'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane'],
        'Manipur': ['Imphal', 'Thoubal', 'Bishnupur'],
        'Meghalaya': ['Shillong', 'Tura', 'Jowai'],
        'Mizoram': ['Aizawl', 'Lunglei', 'Champhai'],
        'Nagaland': ['Kohima', 'Dimapur', 'Mokokchung'],
        'Odisha': ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri'],
        'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
        'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
        'Sikkim': ['Gangtok', 'Namchi', 'Pelling'],
        'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy'],
        'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
        'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar'],
        'Uttar Pradesh': ['Noida', 'Lucknow', 'Agra', 'Varanasi', 'Kanpur'],
        'Uttarakhand': ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital'],
        'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
        'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'],
        'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Ziro'],
        'Other': ['Other'],
    },
    'USA': {
        'California': ['San Francisco', 'Los Angeles', 'San Diego', 'San Jose', 'Sacramento'],
        'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
        'Texas': ['Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth'],
        'Florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
        'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Bellevue'],
        'Massachusetts': ['Boston', 'Cambridge', 'Worcester', 'Springfield'],
        'Illinois': ['Chicago', 'Springfield', 'Naperville', 'Peoria'],
        'Colorado': ['Denver', 'Boulder', 'Colorado Springs', 'Aurora'],
        'Georgia': ['Atlanta', 'Savannah', 'Augusta', 'Columbus'],
        'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Harrisburg', 'Allentown'],
        'Virginia': ['Richmond', 'Arlington', 'Virginia Beach', 'Norfolk'],
        'North Carolina': ['Charlotte', 'Raleigh', 'Durham', 'Greensboro'],
        'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo'],
        'Michigan': ['Detroit', 'Ann Arbor', 'Grand Rapids', 'Lansing'],
        'Arizona': ['Phoenix', 'Tucson', 'Scottsdale', 'Mesa'],
        'Oregon': ['Portland', 'Eugene', 'Salem', 'Bend'],
        'Maryland': ['Baltimore', 'Bethesda', 'Rockville', 'Columbia'],
        'New Jersey': ['Newark', 'Jersey City', 'Princeton', 'Hoboken'],
        'Connecticut': ['Hartford', 'New Haven', 'Stamford', 'Bridgeport'],
        'Utah': ['Salt Lake City', 'Provo', 'Ogden', 'Park City'],
        'Other': ['Other'],
    },
    'UK': {
        'England': ['London', 'Manchester', 'Birmingham', 'Bristol', 'Leeds', 'Liverpool', 'Cambridge', 'Oxford'],
        'Scotland': ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee'],
        'Wales': ['Cardiff', 'Swansea', 'Newport', 'Bangor'],
        'Northern Ireland': ['Belfast', 'Derry', 'Lisburn', 'Newry'],
        'Other': ['Other'],
    },
    'Germany': {
        'Bavaria': ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg'],
        'Berlin': ['Berlin'],
        'Hamburg': ['Hamburg'],
        'Hesse': ['Frankfurt', 'Wiesbaden', 'Darmstadt', 'Kassel'],
        'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Bonn'],
        'Baden-Württemberg': ['Stuttgart', 'Karlsruhe', 'Mannheim', 'Heidelberg', 'Freiburg'],
        'Lower Saxony': ['Hanover', 'Brunswick', 'Osnabrück', 'Göttingen'],
        'Saxony': ['Dresden', 'Leipzig', 'Chemnitz'],
        'Other': ['Other'],
    },
    'Singapore': {
        'Central Region': ['Downtown Core', 'Orchard', 'Marina Bay', 'Bukit Merah'],
        'East Region': ['Tampines', 'Bedok', 'Pasir Ris', 'Changi'],
        'West Region': ['Jurong East', 'Jurong West', 'Clementi', 'Bukit Batok'],
        'North Region': ['Woodlands', 'Yishun', 'Sembawang', 'Admiralty'],
        'North-East Region': ['Sengkang', 'Punggol', 'Hougang', 'Serangoon'],
        'Other': ['Other'],
    },
    'UAE': {
        'Dubai': ['Dubai Marina', 'Downtown Dubai', 'Business Bay', 'DIFC', 'JLT'],
        'Abu Dhabi': ['Abu Dhabi City', 'Al Ain', 'Khalifa City', 'Masdar City'],
        'Sharjah': ['Sharjah City', 'Al Majaz', 'Al Nahda'],
        'Ajman': ['Ajman City'],
        'Ras Al Khaimah': ['RAK City', 'Al Hamra'],
        'Fujairah': ['Fujairah City'],
        'Umm Al Quwain': ['UAQ City'],
        'Other': ['Other'],
    },
    'Australia': {
        'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast'],
        'Victoria': ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo'],
        'Queensland': ['Brisbane', 'Gold Coast', 'Cairns', 'Townsville'],
        'Western Australia': ['Perth', 'Fremantle', 'Bunbury', 'Mandurah'],
        'South Australia': ['Adelaide', 'Mount Gambier', 'Whyalla'],
        'Tasmania': ['Hobart', 'Launceston', 'Devonport'],
        'ACT': ['Canberra'],
        'Northern Territory': ['Darwin', 'Alice Springs'],
        'Other': ['Other'],
    },
    'Canada': {
        'Ontario': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'Waterloo'],
        'British Columbia': ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Kelowna'],
        'Quebec': ['Montreal', 'Quebec City', 'Laval', 'Gatineau'],
        'Alberta': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge'],
        'Manitoba': ['Winnipeg', 'Brandon', 'Steinbach'],
        'Saskatchewan': ['Saskatoon', 'Regina', 'Prince Albert'],
        'Nova Scotia': ['Halifax', 'Dartmouth', 'Sydney'],
        'New Brunswick': ['Fredericton', 'Saint John', 'Moncton'],
        'Other': ['Other'],
    },
    'Japan': {
        'Tokyo': ['Shibuya', 'Shinjuku', 'Minato', 'Chiyoda', 'Roppongi'],
        'Osaka': ['Osaka City', 'Sakai', 'Suita', 'Takatsuki'],
        'Kanagawa': ['Yokohama', 'Kawasaki', 'Kamakura'],
        'Aichi': ['Nagoya', 'Toyota', 'Okazaki'],
        'Fukuoka': ['Fukuoka City', 'Kitakyushu', 'Kurume'],
        'Hokkaido': ['Sapporo', 'Asahikawa', 'Hakodate'],
        'Kyoto': ['Kyoto City', 'Uji', 'Kameoka'],
        'Hyogo': ['Kobe', 'Himeji', 'Amagasaki'],
        'Other': ['Other'],
    },
    'Brazil': {
        'São Paulo': ['São Paulo City', 'Campinas', 'Santos', 'Ribeirão Preto'],
        'Rio de Janeiro': ['Rio de Janeiro City', 'Niterói', 'Petrópolis'],
        'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora'],
        'Paraná': ['Curitiba', 'Londrina', 'Maringá'],
        'Rio Grande do Sul': ['Porto Alegre', 'Caxias do Sul', 'Pelotas'],
        'Bahia': ['Salvador', 'Feira de Santana', 'Vitória da Conquista'],
        'Federal District': ['Brasília'],
        'Pernambuco': ['Recife', 'Olinda', 'Caruaru'],
        'Ceará': ['Fortaleza', 'Sobral', 'Juazeiro do Norte'],
        'Other': ['Other'],
    },
};

/** Get list of states/regions for a country */
export function getStatesForCountry(country: string): string[] {
    const states = COUNTRY_STATES_CITIES[country];
    if (states) return Object.keys(states);
    return ['Other'];
}

/** Get list of cities for a country + state combination */
export function getCitiesForState(country: string, state: string): string[] {
    const states = COUNTRY_STATES_CITIES[country];
    if (states && states[state]) return states[state];
    return ['Other'];
}
