-- Quick City Import SQL
-- Run this to dramatically improve city coverage for better UX

-- New Jersey (currently only 1 city)
INSERT INTO canonical_cities (city_name, state, population, metro_population, is_verified) VALUES
('Newark', 'NJ', 311549, 20140470, true),
('Jersey City', 'NJ', 292449, 20140470, true),
('Paterson', 'NJ', 159732, 20140470, true),
('Elizabeth', 'NJ', 137298, 20140470, true),
('Edison', 'NJ', 107588, 20140470, true),
('Woodbridge', 'NJ', 103639, 20140470, true),
('Lakewood', 'NJ', 102682, 20140470, true),
('Toms River', 'NJ', 95438, 20140470, true),
('Hamilton', 'NJ', 90897, 20140470, true),
('Trenton', 'NJ', 90871, 20140470, true),
('Camden', 'NJ', 76119, 20140470, true),
('Clifton', 'NJ', 85390, 20140470, true),
('Passaic', 'NJ', 69789, 20140470, true),
('Union City', 'NJ', 68589, 20140470, true),
('Bayonne', 'NJ', 67186, 20140470, true),
('East Orange', 'NJ', 64650, 20140470, true),
('Vineland', 'NJ', 60780, null, true),
('New Brunswick', 'NJ', 55676, 20140470, true),
('Irvington', 'NJ', 61176, 20140470, true),
('Atlantic City', 'NJ', 38497, 274534, true)
ON CONFLICT (city_name, state) DO NOTHING;

-- Pennsylvania (currently only 1 city)
INSERT INTO canonical_cities (city_name, state, population, metro_population, is_verified) VALUES
('Philadelphia', 'PA', 1603797, 6245051, true),
('Pittsburgh', 'PA', 302971, 2422299, true),
('Allentown', 'PA', 125845, 865310, true),
('Erie', 'PA', 94831, 270876, true),
('Reading', 'PA', 95112, 421164, true),
('Scranton', 'PA', 76328, 555426, true),
('Bethlehem', 'PA', 75781, 865310, true),
('Lancaster', 'PA', 58039, 545724, true),
('Harrisburg', 'PA', 50099, 577941, true),
('Altoona', 'PA', 43963, 122820, true),
('York', 'PA', 44800, 449058, true),
('State College', 'PA', 42378, 162805, true),
('Wilkes-Barre', 'PA', 44328, 555426, true),
('Chester', 'PA', 32605, 6245051, true),
('Williamsport', 'PA', 27754, 114188, true),
('Lebanon', 'PA', 26814, 143257, true),
('Johnstown', 'PA', 18411, 133472, true),
('McKeesport', 'PA', 17727, 2422299, true),
('Hazleton', 'PA', 25440, 134726, true),
('Easton', 'PA', 27087, 865310, true)
ON CONFLICT (city_name, state) DO NOTHING;

-- Michigan (currently only 1 city)
INSERT INTO canonical_cities (city_name, state, population, metro_population, is_verified) VALUES
('Detroit', 'MI', 639111, 4392041, true),
('Grand Rapids', 'MI', 198917, 1087592, true),
('Warren', 'MI', 139387, 4392041, true),
('Sterling Heights', 'MI', 134346, 4392041, true),
('Ann Arbor', 'MI', 123851, 372258, true),
('Lansing', 'MI', 112644, 541297, true),
('Flint', 'MI', 81252, 406211, true),
('Dearborn', 'MI', 109976, 4392041, true),
('Livonia', 'MI', 93971, 4392041, true),
('Westland', 'MI', 84037, 4392041, true),
('Troy', 'MI', 87294, 4392041, true),
('Farmington Hills', 'MI', 83986, 4392041, true),
('Kalamazoo', 'MI', 75092, 261670, true),
('Wyoming', 'MI', 76501, 1087592, true),
('Southfield', 'MI', 76618, 4392041, true),
('Rochester Hills', 'MI', 76300, 4392041, true),
('Taylor', 'MI', 70811, 4392041, true),
('Pontiac', 'MI', 61606, 4392041, true),
('St. Clair Shores', 'MI', 59749, 4392041, true),
('Royal Oak', 'MI', 59256, 4392041, true)
ON CONFLICT (city_name, state) DO NOTHING;

-- Virginia (currently only 1 city)
INSERT INTO canonical_cities (city_name, state, population, metro_population, is_verified) VALUES
('Virginia Beach', 'VA', 459470, 1799674, true),
('Chesapeake', 'VA', 249422, 1799674, true),
('Norfolk', 'VA', 238005, 1799674, true),
('Richmond', 'VA', 230436, 1314434, true),
('Newport News', 'VA', 186247, 1799674, true),
('Alexandria', 'VA', 159467, 6385162, true),
('Hampton', 'VA', 137148, 1799674, true),
('Portsmouth', 'VA', 97915, 1799674, true),
('Suffolk', 'VA', 94324, 1799674, true),
('Roanoke', 'VA', 100011, 315251, true),
('Lynchburg', 'VA', 79009, 261593, true),
('Harrisonburg', 'VA', 51814, 135571, true),
('Danville', 'VA', 42590, 106561, true),
('Leesburg', 'VA', 52731, 6385162, true),
('Blacksburg', 'VA', 44826, 181863, true),
('Manassas', 'VA', 41038, 6385162, true),
('Petersburg', 'VA', 33458, 1314434, true),
('Fredericksburg', 'VA', 28118, 6385162, true),
('Winchester', 'VA', 28120, 6385162, true),
('Charlottesville', 'VA', 47217, 235232, true)
ON CONFLICT (city_name, state) DO NOTHING;

-- Oregon (currently only 1 city)
INSERT INTO canonical_cities (city_name, state, population, metro_population, is_verified) VALUES
('Portland', 'OR', 652503, 2512859, true),
('Eugene', 'OR', 176654, 382971, true),
('Salem', 'OR', 175535, 433353, true),
('Gresham', 'OR', 114247, 2512859, true),
('Hillsboro', 'OR', 106447, 2512859, true),
('Bend', 'OR', 99178, 198253, true),
('Beaverton', 'OR', 97494, 2512859, true),
('Medford', 'OR', 85824, 223259, true),
('Springfield', 'OR', 63471, 382971, true),
('Corvallis', 'OR', 58856, 95184, true),
('Albany', 'OR', 56472, 95184, true),
('Tigard', 'OR', 54539, 2512859, true),
('Lake Oswego', 'OR', 40731, 2512859, true),
('Keizer', 'OR', 39376, 433353, true),
('Grants Pass', 'OR', 37131, 88090, true),
('Oregon City', 'OR', 37240, 2512859, true),
('McMinnville', 'OR', 34319, 99958, true),
('Redmond', 'OR', 33274, 198253, true),
('Tualatin', 'OR', 27942, 2512859, true),
('West Linn', 'OR', 26767, 2512859, true)
ON CONFLICT (city_name, state) DO NOTHING;

-- Utah (currently only 1 city)
INSERT INTO canonical_cities (city_name, state, population, metro_population, is_verified) VALUES
('Salt Lake City', 'UT', 200567, 1257936, true),
('West Valley City', 'UT', 140230, 1257936, true),
('Provo', 'UT', 115162, 671185, true),
('West Jordan', 'UT', 116961, 1257936, true),
('Orem', 'UT', 98129, 671185, true),
('Sandy', 'UT', 96904, 1257936, true),
('Ogden', 'UT', 87321, 694477, true),
('St. George', 'UT', 95342, 180279, true),
('Layton', 'UT', 81773, 694477, true),
('Taylorsville', 'UT', 60448, 1257936, true),
('South Jordan', 'UT', 77487, 1257936, true),
('Lehi', 'UT', 75907, 671185, true),
('Logan', 'UT', 52778, 147601, true),
('Murray', 'UT', 50637, 1257936, true),
('Draper', 'UT', 51017, 1257936, true),
('Bountiful', 'UT', 45504, 1257936, true),
('Riverton', 'UT', 45285, 1257936, true),
('Roy', 'UT', 39243, 694477, true),
('Pleasant Grove', 'UT', 37726, 671185, true),
('Tooele', 'UT', 35742, 1257936, true)
ON CONFLICT (city_name, state) DO NOTHING;
