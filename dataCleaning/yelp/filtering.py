import csv

state_dict = {
    "AL": "Alabama",
    "AK": "Alaska",
    "AZ": "Arizona",
    "AR": "Arkansas",
    "CA": "California",
    "CO": "Colorado",
    "CT": "Connecticut",
    "DE": "Delaware",
    "FL": "Florida",
    "GA": "Georgia",
    "HI": "Hawaii",
    "ID": "Idaho",
    "IL": "Illinois",
    "IN": "Indiana",
    "IA": "Iowa",
    "KS": "Kansas",
    "KY": "Kentucky",
    "LA": "Louisiana",
    "ME": "Maine",
    "MD": "Maryland",
    "MA": "Massachusetts",
    "MI": "Michigan",
    "MN": "Minnesota",
    "MS": "Mississippi",
    "MO": "Missouri",
    "MT": "Montana",
    "NE": "Nebraska",
    "NV": "Nevada",
    "NH": "New Hampshire",
    "NJ": "New Jersey",
    "NM": "New Mexico",
    "NY": "New York",
    "NC": "North Carolina",
    "ND": "North Dakota",
    "OH": "Ohio",
    "OK": "Oklahoma",
    "OR": "Oregon",
    "PA": "Pennsylvania",
    "RI": "Rhode Island",
    "SC": "South Carolina",
    "SD": "South Dakota",
    "TN": "Tennessee",
    "TX": "Texas",
    "UT": "Utah",
    "VT": "Vermont",
    "VA": "Virginia",
    "WA": "Washington",
    "WV": "West Virginia",
    "WI": "Wisconsin",
    "WY": "Wyoming",
    "DC": "District of Columbia",
    "AS": "American Samoa",
    "GU": "Guam",
    "MP": "Northern Mariana Islands",
    "PR": "Puerto Rico",
    "VI": "U.S. Virgin Islands",
    "FM": "Federated States of Micronesia",
    "MH": "Marshall Islands",
    "PI": "Palau",
    "PW": "Republic of the Marshall Islands"
}

states = {
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
    "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
    "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
    "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", 
    "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", 
    "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
}

states_covered = {"Alabama",
"Arizona",
"Arkansas",
"California",
"Connecticut",
"Delaware",
"Florida",
"Georgia",
"Idaho",
"Illinois",
"Indiana",
"Iowa",
"Kansas",
"Kentucky",
"Louisiana",
"Maine",
"Maryland",
"Michigan",
"Minnesota",
"Mississippi",
"Missouri",
"Nebraska",
"Nevada",
"New Jersey",
"New Mexico",
"New York",
"North Carolina",
"North Dakota",
"Ohio",
"Oklahoma",
"Oregon",
"Pennsylvania",
"Rhode Island",
"South Carolina",
"Tennessee",
"Texas",
"Virginia",
"Washington",
"West Virginia",
"Wisconsin"
}

def main():

    print(states - states_covered)

    # with open('main_new_2.csv', newline='') as infile:
    #     reader = list(csv.reader(infile))

    # with open('attractions.csv', 'r') as infile:
    #     reader = csv.reader(infile)

    #     for row in reader:
    #         states_covered.add(row)


        # city_reader = csv.reader(cities)
        # writer = csv.writer(outfile)

        # for cityrow in city_reader:
        #     cities_set.add(cityrow[1])

        # states_covered = set()

        # for row in reader:
        #     if row[3] in state_dict:
        #         states_covered.add(state_dict[row[3]])
        # # print(states_covered)
        # print(states - states_covered)

        # matched = False
        # for row in reader:
        #     subattractions = row[9]
        #     subattractions_list = [item.strip() for item in subattractions.split(",")]
        #     # Check if subattractions is in the list of home services categories
        #     for each in subattractions_list:
        #         if each == 'Arts & Entertainment' and row[8] == '':
        #             # print(each)
        #             matched = True
            
        #     if matched:
        #         #print("matched")
        #         #print(f"{row[0]}")
        #         # print("MATCHED")
        #         writer.writerow([row[0], row[1], row[2], row[3], row[4], row[5], row[6],row[7],'Arts & Entertainment', row[9]])
        #         matched = False 
        #     else:
        #         matched = False
        #         writer.writerow(row) 

        # category_set = set()
        # for row in reader:
        #      if row[7] == '':
        #         print(row[8])

        # for row in reader:
        #     if row[8] == '':
        #         writer.writerow([row[0], row[1], row[2], row[3], row[4], row[5], row[6],row[7], row[7]])
        #         # print(row[0])
        #     else:
        #         writer.writerow(row)

        # for row in reader:
        #     categories = row[7].split(',')
        #     for each in categories:
        #         if each != '':
        #             category_set.add(each.strip())
        
        # print(category_set)
        # backup = csv.reader(backup_file)
        # writer = csv.writer(outfile)
        # matched = False

        
        # for b_row in backup:
        #     matched = False
        #     #print(f"Current b_row: {b_row[0]}")
        #     for row in reader:
        #         #print(f"Current row: {row[0]}")
        #         if b_row[0] == row[0]:
        #             #print("Found match")
        #             matched = True
            
        #     if not matched:
        #         writer.writerow(b_row)

            # if row[3] != '':
            #     writer.writerow(row)

        # data = {"business_id": "Bj2nIo6ALX9GoUvjBRzKyA", "full_address": "Southeast\nNew York, NY 10036", "hours": {"Monday": {"close": "22:00", "open": "06:00"}, "Tuesday": {"close": "22:00", "open": "06:00"}, "Friday": {"close": "22:00", "open": "06:00"}, "Wednesday": {"close": "22:00", "open": "06:00"}, "Thursday": {"close": "22:00", "open": "06:00"}, "Sunday": {"close": "22:00", "open": "06:00"}, "Saturday": {"close": "22:00", "open": "06:00"}}, "open": 1, "categories": ["Active Life", "Fitness & Instruction", "Trainers", "Boot Camps"], "city": "New York", "review_count": 4, "name": "Mike Todd's Raw Body Boot Camp", "neighborhoods": ["Southeast"], "longitude": -115.11397700000001, "state": "NY", "stars": 5.0, "latitude": 36.067884999999997, "attributes": {"By Appointment Only": 1, "Good for Kids": 1}, "type": "business"}

        # # Extract the relevant fields
        # business_id = data.get("business_id", "")
        # business_name = data.get("name", "")
        # city = data.get("city", "")
        # state_code = data.get("state", "")
        # address = data.get("full_address", "")
        # latitude = data.get("latitude", "")
        # longitude = data.get("longitude", "")
        # rating = data.get("stars", "")
        # categories = data.get("categories", [])

        # # Print the extracted data
        # print("Business ID:", business_id)
        # print("Name:", business_name)
        # print("City:", city)
        # print("State Code:", state_code)
        # print("Address:", address)
        # print("Latitude:", latitude)
        # print("Longitude:", longitude)
        # print("Rating/Stars:", rating)
        # print("Categories:", categories)

        # all_states = {'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'}

        # state_set = set()
        # for row in reader:
        #     state_set.add(row[3])

        # states_excluded = list(all_states - state_set)
        # print("States included:", state_set)

        # print("States excluded:", states_excluded)

        # fieldnames = ['Id', 'CityId' 'CountyName', 'Lat', 'Long', 'Population', 'Density', 'Timezone', 'Ranking', 'Id']
        # fieldnames = ['Business ID','Name','City ID','Address','Latitude','Longitude','Rating','Categories','Subcategories']
        # writer.writerow(fieldnames)

        # states = {}
        # for cityrow in cityreader:
        #     states[cityrow[2]] = cityrow[3]

        # for row in reader:
        #     if row[3] in states:
        #         writer.writerow([row[0], row[1], row[2], states[row[3]], row[4], row[5], row[6], row[7], row[8], row[9]])

        # city_dict = {}
        # for cityrow in cityreader:
        #     state_name = full_to_abbr_state.get(cityrow[2])  # Get full state name, or default to abbreviation if not found
        #     city_key = (cityrow[1], state_name)
        #     city_dict[city_key] = cityrow[0]
        
        # print(city_dict)

        # count = 0
        # for row in reader:
        #     if (row[0] != "Id"):
        #         for cityrow in cityreader:
        #             if row[]
        #         if int(row[8]) >= 140000:
        #             # count += 1
        #             writer.writerow([row[0], row[1], row[2], row[3], row[5], row[6], row[7], row[8], row[9], row[13], row[14], row[16]])
        

        #print(f"The count is: {count}")
        # print(f"The max number of tuples is: {count*count - count}")


if __name__ == '__main__':
    main()