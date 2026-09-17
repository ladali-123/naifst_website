(function () {
  const localApi = new URLSearchParams(location.search).get('api');
  const API = ['localhost', '127.0.0.1'].includes(location.hostname) && /^http:\/\/(localhost|127\.0\.0\.1):\d+\/api$/.test(localApi || '')
    ? localApi
    : (['localhost', '127.0.0.1'].includes(location.hostname)
      ? (location.port === '5501' ? 'http://127.0.0.1:5050/api' : 'http://localhost:5000/api')
      : `${location.origin}/api`);

  const qs = (selector) => document.querySelector(selector);
  const qsa = (selector) => Array.from(document.querySelectorAll(selector));
  const hashParams = new URLSearchParams(location.hash.slice(1));
  const searchParams = new URLSearchParams(location.search);
  const courseId = Number(hashParams.get('courseId') || searchParams.get('courseId') || searchParams.get('id') || 0);
  const courseNameParam = hashParams.get('course') || searchParams.get('course') || searchParams.get('courseName') || '';

  const state = {
    course: null,
    fee: 26500,
    plan: 'full',
    method: 'online',
    draftToken: localStorage.getItem('naisft_checkout_draft_token') || '',
    uploadedDocuments: {},
    busy: false,
  };

  const el = {
    planFull: qs('#planFull'),
    planInstallment: qs('#planInstallment'),
    planOtherPart: qs('#planOtherPart'),
    installmentPanel: qs('#installmentPanel'),
    installmentPanelTitle: qs('#installmentPanelTitle'),
    installmentAmountField: qs('#installmentAmountField'),
    firstInstallmentInput: qs('#firstInstallmentAmount'),
    installmentHelp: qs('#installmentAmountHelp'),
    summaryInstallmentNow: qs('#summaryInstallmentNow'),
    summaryInstallmentLater: qs('#summaryInstallmentLater'),
    summaryFee: qs('#summaryFee'),
    summaryTotal: qs('#summaryTotal'),
    summaryNow: qs('#summaryInstallmentNowAmt'),
    summaryLater: qs('#summaryInstallmentLaterAmt'),
    fullFee: qs('#checkoutFullFee'),
    halfFee: qs('#checkoutHalfFee'),
    halfFee2: qs('#checkoutHalfFee2'),
    partFee: qs('#checkoutPartFee'),
    installmentFirst: qs('#installmentFirst'),
    installmentSecond: qs('#installmentSecond'),
    payBtn: qs('#checkoutPayBtn'),
    form: qs('#admissionForm'),
    formStatus: qs('#formStatus'),
    alert: qs('#checkoutAlert'),
    country: qs('#studentCountry'),
    addressState: qs('#addressState'),
    identityType: qs('#identityType'),
    hiddenCountry: qs('#checkoutCountry'),
    offlineReferenceWrap: qs('#offlineReferenceWrap'),
  };

  const documentInputs = [
    ['identityDocument', 'identityDocumentName'],
    ['academicDocument', 'academicDocumentName'],
    ['passportPhoto', 'passportPhotoName'],
  ];

  const statesByCountry = {
    India: [
      'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
      'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand',
      'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
      'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab',
      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
      'Uttarakhand', 'West Bengal',
    ],
    Bangladesh: ['Barisal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'],
    Nepal: ['Bagmati', 'Gandaki', 'Karnali', 'Koshi', 'Lumbini', 'Madhesh', 'Sudurpashchim'],
    Bhutan: ['Bumthang', 'Chhukha', 'Dagana', 'Gasa', 'Haa', 'Lhuentse', 'Mongar', 'Paro', 'Pemagatshel', 'Punakha', 'Samdrup Jongkhar', 'Samtse', 'Sarpang', 'Thimphu', 'Trashigang', 'Trashiyangtse', 'Trongsa', 'Tsirang', 'Wangdue Phodrang', 'Zhemgang'],
    'Sri Lanka': ['Central', 'Eastern', 'North Central', 'Northern', 'North Western', 'Sabaragamuwa', 'Southern', 'Uva', 'Western'],
    Bahrain: ['Capital', 'Muharraq', 'Northern', 'Southern'],
    Cyprus: ['Famagusta', 'Kyrenia', 'Larnaca', 'Limassol', 'Nicosia', 'Paphos'],
    Egypt: ['Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia', 'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh', 'Luxor', 'Matrouh', 'Minya', 'Monufia', 'New Valley', 'North Sinai', 'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag', 'South Sinai', 'Suez'],
    Iran: ['Alborz', 'Ardabil', 'Bushehr', 'Chaharmahal and Bakhtiari', 'East Azerbaijan', 'Fars', 'Gilan', 'Golestan', 'Hamadan', 'Hormozgan', 'Ilam', 'Isfahan', 'Kerman', 'Kermanshah', 'Khuzestan', 'Kohgiluyeh and Boyer-Ahmad', 'Kurdistan', 'Lorestan', 'Markazi', 'Mazandaran', 'North Khorasan', 'Qazvin', 'Qom', 'Razavi Khorasan', 'Semnan', 'Sistan and Baluchestan', 'South Khorasan', 'Tehran', 'West Azerbaijan', 'Yazd', 'Zanjan'],
    Iraq: ['Al Anbar', 'Al Muthanna', 'Al Qadisiyah', 'Babylon', 'Baghdad', 'Basra', 'Dhi Qar', 'Diyala', 'Dohuk', 'Erbil', 'Karbala', 'Kirkuk', 'Maysan', 'Najaf', 'Nineveh', 'Saladin', 'Sulaymaniyah', 'Wasit'],
    Israel: ['Central', 'Haifa', 'Jerusalem', 'Northern', 'Southern', 'Tel Aviv'],
    Jordan: ['Ajloun', 'Amman', 'Aqaba', 'Balqa', 'Irbid', 'Jerash', 'Karak', 'Ma-an', 'Madaba', 'Mafraq', 'Tafilah', 'Zarqa'],
    UAE: ['Abu Dhabi', 'Ajman', 'Dubai', 'Fujairah', 'Ras Al Khaimah', 'Sharjah', 'Umm Al Quwain'],
    'Saudi Arabia': ['Al Bahah', 'Al Jawf', 'Al Madinah', 'Al Qassim', 'Asir', 'Eastern Province', 'Hail', 'Jazan', 'Makkah', 'Najran', 'Northern Borders', 'Riyadh', 'Tabuk'],
    Qatar: ['Al Daayen', 'Al Khor', 'Al Rayyan', 'Al Shamal', 'Al Wakrah', 'Doha', 'Umm Salal'],
    Oman: ['Ad Dakhiliyah', 'Ad Dhahirah', 'Al Batinah North', 'Al Batinah South', 'Al Buraimi', 'Al Wusta', 'Ash Sharqiyah North', 'Ash Sharqiyah South', 'Dhofar', 'Musandam', 'Muscat'],
    Kuwait: ['Al Ahmadi', 'Al Asimah', 'Al Farwaniyah', 'Al Jahra', 'Hawalli', 'Mubarak Al-Kabeer'],
    Lebanon: ['Akkar', 'Baalbek-Hermel', 'Beirut', 'Beqaa', 'Mount Lebanon', 'Nabatieh', 'North', 'South'],
    Palestine: ['Bethlehem', 'Deir al-Balah', 'Gaza', 'Hebron', 'Jenin', 'Jericho', 'Jerusalem', 'Khan Yunis', 'Nablus', 'North Gaza', 'Qalqilya', 'Rafah', 'Ramallah and Al-Bireh', 'Salfit', 'Tubas', 'Tulkarm'],
    Syria: ['Al Hasakah', 'Al Ladhiqiyah', 'Al Qunaytirah', 'Ar Raqqah', 'As Suwayda', 'Daraa', 'Dayr az Zawr', 'Dimashq', 'Halab', 'Hamah', 'Hims', 'Idlib', 'Rif Dimashq', 'Tartus'],
    Turkey: ['Adana', 'Adiyaman', 'Afyonkarahisar', 'Agri', 'Aksaray', 'Amasya', 'Ankara', 'Antalya', 'Ardahan', 'Artvin', 'Aydin', 'Balikesir', 'Bartin', 'Batman', 'Bayburt', 'Bilecik', 'Bingol', 'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Canakkale', 'Cankiri', 'Corum', 'Denizli', 'Diyarbakir', 'Duzce', 'Edirne', 'Elazig', 'Erzincan', 'Erzurum', 'Eskisehir', 'Gaziantep', 'Giresun', 'Gumushane', 'Hakkari', 'Hatay', 'Igdir', 'Isparta', 'Istanbul', 'Izmir', 'Kahramanmaras', 'Karabuk', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kilis', 'Kirikkale', 'Kirklareli', 'Kirsehir', 'Kocaeli', 'Konya', 'Kutahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Mugla', 'Mus', 'Nevsehir', 'Nigde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Sanliurfa', 'Siirt', 'Sinop', 'Sirnak', 'Sivas', 'Tekirdag', 'Tokat', 'Trabzon', 'Tunceli', 'Usak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'],
    Yemen: ['Abyan', 'Aden', 'Al Bayda', 'Al Hudaydah', 'Al Jawf', 'Al Mahrah', 'Al Mahwit', 'Amanat Al Asimah', 'Amran', 'Dhamar', 'Hadramaut', 'Hajjah', 'Ibb', 'Lahij', 'Marib', 'Raymah', 'Saada', 'Sanaa', 'Shabwah', 'Socotra', 'Taiz'],
    Algeria: ['Adrar', 'Ain Defla', 'Ain Temouchent', 'Algiers', 'Annaba', 'Batna', 'Bechar', 'Bejaia', 'Biskra', 'Blida', 'Bordj Badji Mokhtar', 'Bordj Bou Arreridj', 'Bouira', 'Boumerdes', 'Chlef', 'Constantine', 'Djanet', 'Djelfa', 'El Bayadh', 'El Meghaier', 'El Menia', 'El Oued', 'El Tarf', 'Ghardaia', 'Guelma', 'Illizi', 'In Guezzam', 'In Salah', 'Jijel', 'Khenchela', 'Laghouat', 'Mascara', 'Medea', 'Mila', 'Mostaganem', 'MSila', 'Naama', 'Oran', 'Ouargla', 'Ouled Djellal', 'Oum El Bouaghi', 'Relizane', 'Saida', 'Setif', 'Sidi Bel Abbes', 'Skikda', 'Souk Ahras', 'Tamanghasset', 'Tebessa', 'Tiaret', 'Timimoun', 'Tindouf', 'Tipaza', 'Tissemsilt', 'Tizi Ouzou', 'Tlemcen', 'Touggourt'],
    Angola: ['Bengo', 'Benguela', 'Bie', 'Cabinda', 'Cuando Cubango', 'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huila', 'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico', 'Namibe', 'Uige', 'Zaire'],
    Benin: ['Alibori', 'Atakora', 'Atlantique', 'Borgou', 'Collines', 'Couffo', 'Donga', 'Littoral', 'Mono', 'Oueme', 'Plateau', 'Zou'],
    Botswana: ['Central', 'Chobe', 'Ghanzi', 'Kgalagadi', 'Kgatleng', 'Kweneng', 'North East', 'North West', 'South East', 'Southern'],
    'Burkina Faso': ['Boucle du Mouhoun', 'Cascades', 'Centre', 'Centre-Est', 'Centre-Nord', 'Centre-Ouest', 'Centre-Sud', 'Est', 'Hauts-Bassins', 'Nord', 'Plateau-Central', 'Sahel', 'Sud-Ouest'],
    Burundi: ['Bubanza', 'Bujumbura Mairie', 'Bujumbura Rural', 'Bururi', 'Cankuzo', 'Cibitoke', 'Gitega', 'Karuzi', 'Kayanza', 'Kirundo', 'Makamba', 'Muramvya', 'Muyinga', 'Mwaro', 'Ngozi', 'Rumonge', 'Rutana', 'Ruyigi'],
    'Cabo Verde': ['Boa Vista', 'Brava', 'Maio', 'Mosteiros', 'Paul', 'Porto Novo', 'Praia', 'Ribeira Brava', 'Ribeira Grande', 'Ribeira Grande de Santiago', 'Sal', 'Santa Catarina', 'Santa Catarina do Fogo', 'Santa Cruz', 'Sao Domingos', 'Sao Filipe', 'Sao Lourenco dos Orgaos', 'Sao Miguel', 'Sao Salvador do Mundo', 'Sao Vicente', 'Tarrafal', 'Tarrafal de Sao Nicolau'],
    Cameroon: ['Adamawa', 'Centre', 'East', 'Far North', 'Littoral', 'North', 'Northwest', 'South', 'Southwest', 'West'],
    'Central African Republic': ['Bamingui-Bangoran', 'Bangui', 'Basse-Kotto', 'Haute-Kotto', 'Haut-Mbomou', 'Kemo', 'Lobaye', 'Mambere-Kadei', 'Mbomou', 'Nana-Grebizi', 'Nana-Mambere', 'Ombella-MPoko', 'Ouaka', 'Ouham', 'Ouham-Pende', 'Sangha-Mbaere', 'Vakaga'],
    Chad: ['Bahr el Gazel', 'Batha', 'Borkou', 'Chari-Baguirmi', 'Ennedi-Est', 'Ennedi-Ouest', 'Guera', 'Hadjer-Lamis', 'Kanem', 'Lac', 'Logone Occidental', 'Logone Oriental', 'Mandoul', 'Mayo-Kebbi Est', 'Mayo-Kebbi Ouest', 'Moyen-Chari', 'NDjamena', 'Ouaddai', 'Salamat', 'Sila', 'Tandjile', 'Tibesti', 'Wadi Fira'],
    Comoros: ['Anjouan', 'Grande Comore', 'Moheli'],
    Congo: ['Bouenza', 'Brazzaville', 'Cuvette', 'Cuvette-Ouest', 'Kouilou', 'Lekoumou', 'Likouala', 'Niari', 'Plateaux', 'Pointe-Noire', 'Pool', 'Sangha'],
    'Democratic Republic of the Congo': ['Bas-Uele', 'Equateur', 'Haut-Katanga', 'Haut-Lomami', 'Haut-Uele', 'Ituri', 'Kasai', 'Kasai-Central', 'Kasai-Oriental', 'Kinshasa', 'Kongo Central', 'Kwango', 'Kwilu', 'Lomami', 'Lualaba', 'Mai-Ndombe', 'Maniema', 'Mongala', 'Nord-Kivu', 'Nord-Ubangi', 'Sankuru', 'Sud-Kivu', 'Sud-Ubangi', 'Tanganyika', 'Tshopo', 'Tshuapa'],
    "Cote d'Ivoire": ['Abidjan', 'Bas-Sassandra', 'Comoe', 'Denguele', 'Goh-Djiboua', 'Lacs', 'Lagunes', 'Montagnes', 'Sassandra-Marahoue', 'Savanes', 'Vallee du Bandama', 'Woroba', 'Yamoussoukro', 'Zanzan'],
    Djibouti: ['Ali Sabieh', 'Arta', 'Dikhil', 'Djibouti', 'Obock', 'Tadjourah'],
    'Equatorial Guinea': ['Annobon', 'Bioko Norte', 'Bioko Sur', 'Centro Sur', 'Djibloho', 'Kie-Ntem', 'Litoral', 'Wele-Nzas'],
    Eritrea: ['Anseba', 'Debub', 'Gash-Barka', 'Maekel', 'Northern Red Sea', 'Southern Red Sea'],
    Eswatini: ['Hhohho', 'Lubombo', 'Manzini', 'Shiselweni'],
    Ethiopia: ['Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Central Ethiopia', 'Dire Dawa', 'Gambela', 'Harari', 'Oromia', 'Sidama', 'Somali', 'South Ethiopia', 'South West Ethiopia', 'Tigray'],
    Gabon: ['Estuaire', 'Haut-Ogooue', 'Moyen-Ogooue', 'Ngounie', 'Nyanga', 'Ogooue-Ivindo', 'Ogooue-Lolo', 'Ogooue-Maritime', 'Woleu-Ntem'],
    Gambia: ['Banjul', 'Central River', 'Lower River', 'North Bank', 'Upper River', 'West Coast'],
    Ghana: ['Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'],
    Guinea: ['Boke', 'Conakry', 'Faranah', 'Kankan', 'Kindia', 'Labe', 'Mamou', 'Nzerekore'],
    'Guinea-Bissau': ['Bafata', 'Biombo', 'Bissau', 'Bolama', 'Cacheu', 'Gabu', 'Oio', 'Quinara', 'Tombali'],
    Kenya: ['Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Muranga', 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'],
    Lesotho: ['Berea', 'Butha-Buthe', 'Leribe', 'Mafeteng', 'Maseru', 'Mohales Hoek', 'Mokhotlong', 'Qachas Nek', 'Quthing', 'Thaba-Tseka'],
    Liberia: ['Bomi', 'Bong', 'Gbarpolu', 'Grand Bassa', 'Grand Cape Mount', 'Grand Gedeh', 'Grand Kru', 'Lofa', 'Margibi', 'Maryland', 'Montserrado', 'Nimba', 'River Cess', 'River Gee', 'Sinoe'],
    Libya: ['Al Butnan', 'Al Jabal al Akhdar', 'Al Jabal al Gharbi', 'Al Jafara', 'Al Jufra', 'Al Kufrah', 'Al Marj', 'Al Marqab', 'Al Wahat', 'An Nuqat al Khams', 'Az Zawiyah', 'Benghazi', 'Derna', 'Ghat', 'Misrata', 'Murzuq', 'Nalut', 'Sabha', 'Sirte', 'Tripoli', 'Wadi al Hayaa', 'Wadi al Shatii'],
    Madagascar: ['Alaotra-Mangoro', 'AmoronI Mania', 'Analamanga', 'Analanjirofo', 'Androy', 'Anosy', 'Atsimo-Andrefana', 'Atsimo-Atsinanana', 'Atsinanana', 'Betsiboka', 'Boeny', 'Bongolava', 'Diana', 'Haute Matsiatra', 'Ihorombe', 'Itasy', 'Melaky', 'Menabe', 'Sava', 'Sofia', 'Vakinankaratra', 'Vatovavy-Fitovinany'],
    Malawi: ['Balaka', 'Blantyre', 'Chikwawa', 'Chiradzulu', 'Chitipa', 'Dedza', 'Dowa', 'Karonga', 'Kasungu', 'Likoma', 'Lilongwe', 'Machinga', 'Mangochi', 'Mchinji', 'Mulanje', 'Mwanza', 'Mzimba', 'Neno', 'Nkhata Bay', 'Nkhotakota', 'Nsanje', 'Ntcheu', 'Ntchisi', 'Phalombe', 'Rumphi', 'Salima', 'Thyolo', 'Zomba'],
    Mali: ['Bamako', 'Gao', 'Kayes', 'Kidal', 'Koulikoro', 'Menaka', 'Mopti', 'Segou', 'Sikasso', 'Taoudenit', 'Tombouctou'],
    Mauritania: ['Adrar', 'Assaba', 'Brakna', 'Dakhlet Nouadhibou', 'Gorgol', 'Guidimaka', 'Hodh Ech Chargui', 'Hodh El Gharbi', 'Inchiri', 'Nouakchott-Nord', 'Nouakchott-Ouest', 'Nouakchott-Sud', 'Tagant', 'Tiris Zemmour', 'Trarza'],
    Mauritius: ['Agalega Islands', 'Black River', 'Cargados Carajos', 'Flacq', 'Grand Port', 'Moka', 'Pamplemousses', 'Plaines Wilhems', 'Port Louis', 'Riviere du Rempart', 'Rodrigues', 'Savanne'],
    Morocco: ['Beni Mellal-Khenifra', 'Casablanca-Settat', 'Dakhla-Oued Ed-Dahab', 'Draa-Tafilalet', 'Fes-Meknes', 'Guelmim-Oued Noun', 'Laayoune-Sakia El Hamra', 'Marrakesh-Safi', 'Oriental', 'Rabat-Sale-Kenitra', 'Souss-Massa', 'Tanger-Tetouan-Al Hoceima'],
    Mozambique: ['Cabo Delgado', 'Gaza', 'Inhambane', 'Manica', 'Maputo City', 'Maputo Province', 'Nampula', 'Niassa', 'Sofala', 'Tete', 'Zambezia'],
    Namibia: ['Erongo', 'Hardap', 'Karas', 'Kavango East', 'Kavango West', 'Khomas', 'Kunene', 'Ohangwena', 'Omaheke', 'Omusati', 'Oshana', 'Oshikoto', 'Otjozondjupa', 'Zambezi'],
    Niger: ['Agadez', 'Diffa', 'Dosso', 'Maradi', 'Niamey', 'Tahoua', 'Tillaberi', 'Zinder'],
    Nigeria: ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'],
    Rwanda: ['Eastern', 'Kigali', 'Northern', 'Southern', 'Western'],
    'Sao Tome and Principe': ['Principe', 'Sao Tome'],
    Senegal: ['Dakar', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kedougou', 'Kolda', 'Louga', 'Matam', 'Saint-Louis', 'Sedhiou', 'Tambacounda', 'Thies', 'Ziguinchor'],
    Seychelles: ['Anse aux Pins', 'Anse Boileau', 'Anse Etoile', 'Anse Royale', 'Au Cap', 'Baie Lazare', 'Baie Sainte Anne', 'Beau Vallon', 'Bel Air', 'Bel Ombre', 'Cascade', 'English River', 'Glacis', 'Grand Anse Mahe', 'Grand Anse Praslin', 'La Digue', 'Les Mamelles', 'Mont Buxton', 'Mont Fleuri', 'Plaisance', 'Pointe Larue', 'Port Glaud', 'Roche Caiman', 'Saint Louis', 'Takamaka'],
    'Sierra Leone': ['Eastern', 'North Western', 'Northern', 'Southern', 'Western Area'],
    Somalia: ['Awdal', 'Bakool', 'Banaadir', 'Bari', 'Bay', 'Galguduud', 'Gedo', 'Hiiraan', 'Lower Juba', 'Lower Shabelle', 'Middle Juba', 'Middle Shabelle', 'Mudug', 'Nugaal', 'Sanaag', 'Sool', 'Togdheer', 'Woqooyi Galbeed'],
    'South Africa': ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'],
    'South Sudan': ['Central Equatoria', 'Eastern Equatoria', 'Jonglei', 'Lakes', 'Northern Bahr el Ghazal', 'Unity', 'Upper Nile', 'Warrap', 'Western Bahr el Ghazal', 'Western Equatoria'],
    Sudan: ['Al Jazirah', 'Al Qadarif', 'Blue Nile', 'Central Darfur', 'East Darfur', 'Kassala', 'Khartoum', 'North Darfur', 'North Kordofan', 'Northern', 'Red Sea', 'River Nile', 'Sennar', 'South Darfur', 'South Kordofan', 'West Darfur', 'West Kordofan', 'White Nile'],
    Tanzania: ['Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pemba North', 'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Zanzibar Central/South', 'Zanzibar North', 'Zanzibar Urban/West'],
    Togo: ['Centrale', 'Kara', 'Maritime', 'Plateaux', 'Savanes'],
    Tunisia: ['Ariana', 'Beja', 'Ben Arous', 'Bizerte', 'Gabes', 'Gafsa', 'Jendouba', 'Kairouan', 'Kasserine', 'Kebili', 'Kef', 'Mahdia', 'Manouba', 'Medenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'],
    Uganda: ['Central', 'Eastern', 'Northern', 'Western'],
    Zambia: ['Central', 'Copperbelt', 'Eastern', 'Luapula', 'Lusaka', 'Muchinga', 'Northern', 'North-Western', 'Southern', 'Western'],
    Zimbabwe: ['Bulawayo', 'Harare', 'Manicaland', 'Mashonaland Central', 'Mashonaland East', 'Mashonaland West', 'Masvingo', 'Matabeleland North', 'Matabeleland South', 'Midlands'],
    'Western Sahara': ['Aousserd', 'Boujdour', 'Es Semara', 'Laayoune', 'Oued Ed-Dahab'],
    Other: ['Other / Not listed'],
  };

  const countries = [
    { flag: '🇮🇳', name: 'India', dial: '+91' },
    { flag: '🇦🇪', name: 'UAE', dial: '+971' },
    { flag: '🇸🇦', name: 'Saudi Arabia', dial: '+966' },
    { flag: '🇶🇦', name: 'Qatar', dial: '+974' },
    { flag: '🇰🇼', name: 'Kuwait', dial: '+965' },
    { flag: '🇧🇭', name: 'Bahrain', dial: '+973' },
    { flag: '🇴🇲', name: 'Oman', dial: '+968' },
    { flag: '🇺🇸', name: 'United States', dial: '+1' },
    { flag: '🇬🇧', name: 'United Kingdom', dial: '+44' },
    { flag: '🇦🇺', name: 'Australia', dial: '+61' },
    { flag: '🇨🇦', name: 'Canada', dial: '+1' },
    { flag: '🇸🇬', name: 'Singapore', dial: '+65' },
    { flag: '🇲🇾', name: 'Malaysia', dial: '+60' },
    { flag: '🇳🇵', name: 'Nepal', dial: '+977' },
    { flag: '🇧🇩', name: 'Bangladesh', dial: '+880' },
    { flag: '🇱🇰', name: 'Sri Lanka', dial: '+94' },
    { flag: '🇵🇰', name: 'Pakistan', dial: '+92' },
    { flag: '🇲🇻', name: 'Maldives', dial: '+960' },
    { flag: '🇲🇲', name: 'Myanmar', dial: '+95' },
    { flag: '🇹🇭', name: 'Thailand', dial: '+66' },
    { flag: '🇮🇩', name: 'Indonesia', dial: '+62' },
    { flag: '🇵🇭', name: 'Philippines', dial: '+63' },
    { flag: '🇻🇳', name: 'Vietnam', dial: '+84' },
    { flag: '🇯🇵', name: 'Japan', dial: '+81' },
    { flag: '🇰🇷', name: 'South Korea', dial: '+82' },
    { flag: '🇨🇳', name: 'China', dial: '+86' },
    { flag: '🇩🇪', name: 'Germany', dial: '+49' },
    { flag: '🇫🇷', name: 'France', dial: '+33' },
    { flag: '🇮🇹', name: 'Italy', dial: '+39' },
    { flag: '🇪🇸', name: 'Spain', dial: '+34' },
    { flag: '🇳🇱', name: 'Netherlands', dial: '+31' },
    { flag: '🇧🇪', name: 'Belgium', dial: '+32' },
    { flag: '🇸🇪', name: 'Sweden', dial: '+46' },
    { flag: '🇳🇴', name: 'Norway', dial: '+47' },
    { flag: '🇩🇰', name: 'Denmark', dial: '+45' },
    { flag: '🇨🇭', name: 'Switzerland', dial: '+41' },
    { flag: '🇦🇹', name: 'Austria', dial: '+43' },
    { flag: '🇵🇱', name: 'Poland', dial: '+48' },
    { flag: '🇷🇺', name: 'Russia', dial: '+7' },
    { flag: '🇹🇷', name: 'Turkey', dial: '+90' },
    { flag: '🇬🇷', name: 'Greece', dial: '+30' },
    { flag: '🇪🇬', name: 'Egypt', dial: '+20' },
    { flag: '🇯🇴', name: 'Jordan', dial: '+962' },
    { flag: '🇮🇶', name: 'Iraq', dial: '+964' },
    { flag: '🇾🇪', name: 'Yemen', dial: '+967' },
    { flag: '🇿🇦', name: 'South Africa', dial: '+27' },
    { flag: '🇳🇬', name: 'Nigeria', dial: '+234' },
    { flag: '🇰🇪', name: 'Kenya', dial: '+254' },
    { flag: '🇬🇭', name: 'Ghana', dial: '+233' },
    { flag: '🇺🇬', name: 'Uganda', dial: '+256' },
    { flag: '🇧🇷', name: 'Brazil', dial: '+55' },
    { flag: '🇲🇽', name: 'Mexico', dial: '+52' },
    { flag: '🇦🇷', name: 'Argentina', dial: '+54' },
    { flag: '🇳🇿', name: 'New Zealand', dial: '+64' },
    { flag: '🇫🇯', name: 'Fiji', dial: '+679' },
  ];

  let selectedDial = '+91';

  function localMobileDigits() {
    const digits = String(qs('#studentMobile')?.value || '').replace(/\D/g, '');
    if (selectedDial === '+91') {
      return digits.replace(/^0+/, '').slice(0, 10);
    }
    return digits.slice(0, 15);
  }

  function checkoutMobileValue() {
    const digits = localMobileDigits();
    return digits ? `${selectedDial}${digits}` : '';
  }

  function formatINR(value) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  }

  function cleanAmount(value) {
    const amount = Number(String(value || '').replace(/[^\d.]/g, ''));
    if (!Number.isFinite(amount)) return 0;
    return Math.round(amount);
  }

  function minimumInstallment() {
    return Math.min(5000, Math.max(1, Number(state.fee || 0) - 1));
  }

  function splitPaymentsAllowed() {
    return Number(state.fee || 0) > 499;
  }

  function firstInstallmentAmount() {
    if (state.plan === 'full') return Number(state.fee || 0);
    if (state.plan === 'installment') return Math.round(Number(state.fee || 0) / 2);
    const entered = cleanAmount(el.firstInstallmentInput?.value);
    return entered || minimumInstallment();
  }

  function remainingInstallmentAmount() {
    return Math.max(0, Number(state.fee || 0) - firstInstallmentAmount());
  }

  function installmentIsValid() {
    if (state.plan === 'full') return true;
    const first = firstInstallmentAmount();
    return first >= minimumInstallment() && first < Number(state.fee || 0);
  }

  function isPartPayment() {
    return state.plan === 'part';
  }

  function apiPaymentPlan() {
    return state.plan === 'full' ? 'full' : 'installment';
  }

  function showAlert(message, type = 'info') {
    if (!el.alert) return;
    el.alert.textContent = message || '';
    el.alert.className = message ? `checkout-alert active ${type}` : 'checkout-alert';
    if (message) el.alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  async function fetchJson(url, options) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Request failed.');
    }
    return data;
  }

  function setBusy(isBusy) {
    state.busy = Boolean(isBusy);
    if (!el.payBtn) return;
    el.payBtn.disabled = state.busy || !validateAdmissionForm(false);
    if (state.busy) {
      el.payBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
      return;
    }
    updatePayButton();
  }

  function updatePayButton() {
    const complete = validateAdmissionForm(false);
    if (!el.payBtn) return;
    el.payBtn.disabled = !complete || state.busy;
    if (!complete) {
      el.payBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Complete details to pay';
      return;
    }
    if (state.method === 'offline') {
      el.payBtn.innerHTML = '<i class="fa-solid fa-building-columns"></i> Submit Offline Request';
      return;
    }
    const payable = state.plan === 'full' ? state.fee : firstInstallmentAmount();
    el.payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay ${formatINR(payable)} Securely`;
  }

  function updatePricing() {
    const fee = Number(state.fee || 0);
    const canSplit = splitPaymentsAllowed();
    if (!canSplit && state.plan !== 'full') {
      state.plan = 'full';
    }
    const first = state.plan === 'full' ? fee : firstInstallmentAmount();
    const second = state.plan === 'full' ? 0 : remainingInstallmentAmount();
    const isSplitPayment = canSplit && state.plan !== 'full';
    const half = Math.round(fee / 2);
    const partMinimum = minimumInstallment();

    if (el.fullFee) el.fullFee.textContent = formatINR(fee);
    if (el.halfFee) el.halfFee.textContent = formatINR(half);
    if (el.halfFee2) el.halfFee2.textContent = formatINR(fee - half);
    if (el.partFee) el.partFee.textContent = formatINR(partMinimum);
    if (el.installmentFirst) el.installmentFirst.textContent = formatINR(first);
    if (el.installmentSecond) el.installmentSecond.textContent = formatINR(second);
    if (el.summaryFee) el.summaryFee.textContent = formatINR(fee);
    if (el.summaryNow) el.summaryNow.textContent = formatINR(first);
    if (el.summaryLater) el.summaryLater.textContent = formatINR(second);
    if (el.summaryTotal) el.summaryTotal.textContent = formatINR(isSplitPayment ? first : fee);

    el.planFull?.classList.toggle('plan-active', state.plan === 'full');
    el.planInstallment?.classList.toggle('plan-active', state.plan === 'installment');
    el.planOtherPart?.classList.toggle('plan-active', state.plan === 'part');
    if (el.planInstallment) el.planInstallment.style.display = canSplit ? '' : 'none';
    if (el.planOtherPart) el.planOtherPart.style.display = canSplit ? '' : 'none';
    if (el.installmentPanel) el.installmentPanel.style.display = isSplitPayment ? 'block' : 'none';
    if (el.installmentPanelTitle) el.installmentPanelTitle.textContent = state.plan === 'part' ? 'Other part payment schedule' : 'Installment schedule';
    if (el.installmentAmountField) el.installmentAmountField.style.display = isPartPayment() ? 'flex' : 'none';
    if (el.summaryInstallmentNow) el.summaryInstallmentNow.style.display = isSplitPayment ? 'flex' : 'none';
    if (el.summaryInstallmentLater) el.summaryInstallmentLater.style.display = isSplitPayment ? 'flex' : 'none';

    if (el.installmentHelp) {
      const min = minimumInstallment();
      el.installmentHelp.className = installmentIsValid() ? 'success' : 'error';
      el.installmentHelp.textContent = isPartPayment()
        ? `Minimum first payment: ${formatINR(min)}. Remaining balance updates automatically.`
        : '';
    }

    updatePayButton();
  }

  async function loadCourse() {
    const fallbackCourseImage = window.NAISFT_COURSE_IMAGES?.get({ id: courseId, name: courseNameParam });
    if (fallbackCourseImage && qs('#checkoutCourseImage')) qs('#checkoutCourseImage').src = fallbackCourseImage;

    if (courseNameParam) {
      qs('#checkoutCourseName').textContent = courseNameParam;
      qs('#summaryCourseLabel').textContent = `${courseNameParam}:`;
    }

    if (!courseId) {
      updatePricing();
      return;
    }

    try {
      const data = await fetchJson(`${API}/courses/${courseId}`);
      const course = data.course;
      state.course = course;
      state.fee = Number(course.fee || state.fee);
      qs('#checkoutCourseName').textContent = course.name;
      qs('#summaryCourseLabel').textContent = `${course.name}:`;
      const image = course.imageUrl || course.image || course.thumbnail || window.NAISFT_COURSE_IMAGES?.get(course);
      if (image && qs('#checkoutCourseImage')) qs('#checkoutCourseImage').src = image;
      updatePricing();
    } catch (err) {
      showAlert('Could not load live course fee. If the server is waking up, click refresh in a few seconds.', 'error');
      updatePricing();
    }
  }

  function populateIdentityOptions() {
    const isIndia = el.country?.value === 'India';
    const options = isIndia
      ? ['Passport', 'Aadhaar Card', 'Voter ID', 'Driving License', 'PAN Card', 'Emirates ID', 'IQAMA', 'Any Other ID']
      : ['Passport', 'National ID', 'Driving License', 'Residence Permit', 'Government ID', 'Emirates ID', 'IQAMA', 'Any Other ID'];

    if (el.identityType) {
      el.identityType.innerHTML = options.map((item) => `<option value="${item}">${item}</option>`).join('');
    }
    if (el.hiddenCountry && el.country) el.hiddenCountry.value = el.country.value;

    const guidance = qs('#docGuidance');
    const identityDocLabel = qs('#identityDocumentName');
    const identityInput = qs('#identityDocument');
    if (isIndia) {
      if (guidance) guidance.innerHTML = '<strong>For Indian students:</strong> Upload Passport, Aadhaar Card, Voter ID, Driving License, PAN Card, Emirates ID, IQAMA or any other valid ID.';
      if (identityDocLabel && (!identityInput?.files || identityInput.files.length === 0)) identityDocLabel.textContent = 'Passport / Aadhaar / Voter ID / Driving License / PAN / Emirates ID / IQAMA';
    } else {
      if (guidance) guidance.innerHTML = '<strong>For international students:</strong> Upload Passport, National ID, Driving License, Residence ID, Emirates ID, IQAMA or any other valid ID.';
      if (identityDocLabel && (!identityInput?.files || identityInput.files.length === 0)) identityDocLabel.textContent = 'Passport / National ID / Driving License / Residence ID / Emirates ID / IQAMA / Any Other ID';
    }
    validateAdmissionForm();
  }

  function countryLabel(country) {
    return country === 'UAE' ? 'United Arab Emirates' : country;
  }

  function populateCountryOptions() {
    if (!el.country) return;
    const preferred = [
      'India', 'Bangladesh', 'Nepal', 'Bhutan', 'Sri Lanka',
      'UAE', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain',
    ];
    const allCountries = Object.keys(statesByCountry).filter((country) => country !== 'Other');
    const orderedCountries = [
      ...preferred.filter((country) => allCountries.includes(country)),
      ...allCountries.filter((country) => !preferred.includes(country)).sort((a, b) => a.localeCompare(b)),
    ];
    const current = el.country.value || 'India';
    el.country.innerHTML = orderedCountries
      .map((country) => `<option value="${country}">${countryLabel(country)}</option>`)
      .join('') + '<option value="Other">Other Country</option>';
    el.country.value = statesByCountry[current] ? current : 'India';
    if (el.hiddenCountry) el.hiddenCountry.value = el.country.value;
  }

  function populateStateOptions() {
    if (!el.addressState) return;
    const country = el.country?.value || 'India';
    const states = statesByCountry[country] || statesByCountry.Other;
    const current = el.addressState.value;
    el.addressState.innerHTML = '<option value="">Select State</option>' + states
      .map((stateName) => `<option value="${stateName}">${stateName}</option>`)
      .join('');
    if (current && states.includes(current)) {
      el.addressState.value = current;
    }
    if (el.hiddenCountry && el.country) el.hiddenCountry.value = el.country.value;
    const hiddenState = qs('#checkoutState');
    if (hiddenState) hiddenState.value = el.addressState.value;
    validateAdmissionForm();
    updatePayButton();
  }

  function addressParts() {
    return {
      line1: qs('#addressLine1')?.value?.trim() || '',
      line2: qs('#addressLine2')?.value?.trim() || '',
      landmark: qs('#addressLandmark')?.value?.trim() || '',
      pincode: qs('#addressPincode')?.value?.trim() || '',
      city: qs('#addressCity')?.value?.trim() || '',
      state: qs('#addressState')?.value?.trim() || '',
      country: qs('#studentCountry')?.value?.trim() || '',
    };
  }

  function combinedAddress() {
    const parts = addressParts();
    return [
      parts.line1,
      parts.line2,
      parts.landmark ? `Landmark: ${parts.landmark}` : '',
      parts.city,
      parts.state,
      parts.country,
      parts.pincode ? `PIN/ZIP: ${parts.pincode}` : '',
    ].filter(Boolean).join(', ');
  }

  function validateAdmissionForm(showErrors = true) {
    if (!el.form || !el.payBtn) return false;
    const required = [
      '#studentFullName',
      '#studentDob',
      '#studentEmail',
      '#studentMobile',
      '#studentCountry',
      '#addressLine1',
      '#addressLine2',
      '#addressPincode',
      '#addressCity',
      '#addressState',
      '#identityType',
      '#identityDocument',
      '#academicDocument',
      '#passportPhoto',
    ];
    let complete = true;

    required.forEach((selector) => {
      const field = qs(selector);
      if (!field) return;
      const valid = field.type === 'file'
        ? Boolean(field.files && field.files.length)
        : String(field.value || '').trim().length > 0;
      if (showErrors) field.closest('.checkout-field, .upload-box')?.classList.toggle('field-error', !valid);
      if (!valid) complete = false;
    });

    const email = qs('#studentEmail');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) complete = false;
    const mobileDigits = localMobileDigits();
    const validMobile = selectedDial === '+91'
      ? /^[6-9]\d{9}$/.test(mobileDigits)
      : mobileDigits.length >= 6 && mobileDigits.length <= 15;
    if (!validMobile) complete = false;
    if (!installmentIsValid()) complete = false;

    if (el.formStatus) {
      el.formStatus.className = `access-status ${complete ? 'success' : ''}`;
      el.formStatus.textContent = complete
        ? 'All required details are complete. Student can proceed with payment.'
        : 'Complete required fields, uploads and installment amount to unlock payment.';
    }
    return complete;
  }

  function bindFileLabel(inputId, labelId) {
    const input = qs(`#${inputId}`);
    const label = qs(`#${labelId}`);
    if (!input || !label) return;
    input.addEventListener('change', () => {
      if (!input.files || !input.files.length) return;
      const file = input.files[0];
      if (file.size > 6 * 1024 * 1024) {
        input.value = '';
        label.textContent = 'File too large. Max 6MB.';
        label.style.color = '#a90608';
      } else {
        label.textContent = file.name;
        label.style.color = '#166534';
      }
      validateAdmissionForm();
      updatePayButton();
    });
  }

  function initPhonePicker() {
    const picker = qs('#checkoutPhonePicker');
    const trigger = qs('#checkoutPhoneTrigger');
    const dropdown = qs('#checkoutPhoneDropdown');
    const search = qs('#checkoutPhoneSearch');
    const list = qs('#checkoutPhoneList');
    const flagEl = qs('#checkoutPhoneFlag');
    const codeEl = qs('#checkoutPhoneCode');
    const phoneInput = qs('#studentMobile');
    if (!picker || !trigger || !dropdown || !search || !list || !flagEl || !codeEl || !phoneInput) return;

    function closeDropdown() {
      dropdown.hidden = true;
      picker.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function renderList(filter = '') {
      const q = filter.toLowerCase().trim();
      const filtered = q
        ? countries.filter((country) => country.name.toLowerCase().includes(q) || country.dial.includes(q))
        : countries;

      list.innerHTML = filtered.map((country) => `
        <li role="option" data-dial="${country.dial}" data-flag="${country.flag}"${country.dial === selectedDial ? ' class="selected"' : ''}>
          <span class="checkout-phone-list-flag">${country.flag}</span>
          <span class="checkout-phone-list-name">${country.name}</span>
          <span class="checkout-phone-list-dial">${country.dial}</span>
        </li>
      `).join('');

      list.querySelectorAll('li').forEach((item) => {
        item.addEventListener('click', () => {
          selectedDial = item.dataset.dial || '+91';
          flagEl.textContent = item.dataset.flag || '🇮🇳';
          codeEl.textContent = selectedDial;
          closeDropdown();
          phoneInput.focus();
          validateAdmissionForm(false);
          updatePayButton();
        });
      });
    }

    function openDropdown() {
      dropdown.hidden = false;
      picker.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      search.value = '';
      renderList('');
      search.focus();
    }

    trigger.addEventListener('click', () => {
      if (dropdown.hidden) openDropdown();
      else closeDropdown();
    });
    search.addEventListener('input', () => renderList(search.value));
    document.addEventListener('click', (event) => {
      if (!picker.contains(event.target)) closeDropdown();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeDropdown();
    });
    phoneInput.addEventListener('input', () => {
      const cleaned = localMobileDigits();
      if (phoneInput.value !== cleaned) phoneInput.value = cleaned;
    });

    renderList('');
  }

  function selectedCourseId() {
    return state.course?.id || courseId || 0;
  }

  function collectAdmissionData(documents) {
    return {
      draftToken: state.draftToken,
      fullName: qs('#studentFullName')?.value?.trim(),
      dob: qs('#studentDob')?.value,
      email: qs('#studentEmail')?.value?.trim(),
      mobile: checkoutMobileValue(),
      country: qs('#studentCountry')?.value,
      qualification: qs('#studentQualification')?.value?.trim(),
      address: combinedAddress(),
      identityType: qs('#identityType')?.value,
      courseId: selectedCourseId(),
      paymentPlan: apiPaymentPlan(),
      paymentMethod: state.method,
      firstInstallmentAmount: state.plan === 'full' ? null : firstInstallmentAmount(),
      source: 'course_checkout_admission',
      details: {
        paymentPlanType: state.plan,
        paymentPlanLabel: state.plan === 'part' ? 'Other Part Payment' : (state.plan === 'installment' ? 'Pay in Installment' : 'Full Training Fee'),
        dob: qs('#studentDob')?.value,
        country: qs('#studentCountry')?.value,
        qualification: qs('#studentQualification')?.value?.trim(),
        address: combinedAddress(),
        addressParts: addressParts(),
        identityType: qs('#identityType')?.value,
        offlineReference: qs('#offlineReference')?.value?.trim(),
        documents: documents || state.uploadedDocuments,
      },
    };
  }

  async function saveDraft(documents) {
    const data = await fetchJson(`${API}/checkout/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(collectAdmissionData(documents)),
    });
    state.draftToken = data.draft?.token || state.draftToken;
    if (state.draftToken) localStorage.setItem('naisft_checkout_draft_token', state.draftToken);
    return data.draft;
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(new Error('Could not read uploaded file.'));
      reader.readAsDataURL(file);
    });
  }

  async function uploadOneFile(inputId, docType) {
    const input = qs(`#${inputId}`);
    const file = input?.files?.[0];
    if (!file) return null;

    const base64 = await fileToBase64(file);
    const data = await fetchJson(`${API}/checkout/upload-file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draftToken: state.draftToken,
        mobile: checkoutMobileValue(),
        fileName: file.name,
        mimeType: file.type,
        base64,
      }),
    });
    return {
      docType,
      fileName: data.file.fileName,
      fileUrl: data.file.fileUrl,
      mimeType: data.file.mimeType,
      size: data.file.size,
    };
  }

  async function uploadDocuments() {
    const docs = {};
    for (const [inputId] of documentInputs) {
      const uploaded = await uploadOneFile(inputId, inputId);
      if (uploaded) docs[inputId] = uploaded;
    }
    state.uploadedDocuments = docs;
    return docs;
  }

  async function submitOfflineRequest() {
    await saveDraft(state.uploadedDocuments);
    showAlert('Offline admission request submitted. The training centre will verify payment/documents manually.', 'success');
  }

  async function startRazorpayPayment() {
    const order = await fetchJson(`${API}/payment/create-draft-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        draftToken: state.draftToken,
        courseId: selectedCourseId(),
        plan: apiPaymentPlan(),
        firstInstallmentAmount: state.plan === 'full' ? null : firstInstallmentAmount(),
      }),
    });

    const razorpay = new Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'NAISFT INDIA',
      description: order.courseName || qs('#checkoutCourseName')?.textContent || 'Course admission',
      order_id: order.orderId,
      prefill: {
        name: order.studentName || qs('#studentFullName')?.value || '',
        email: order.studentEmail || qs('#studentEmail')?.value || '',
        contact: order.studentPhone || checkoutMobileValue(),
      },
      notes: {
        courseId: String(selectedCourseId()),
        draftToken: state.draftToken,
        paymentPlan: apiPaymentPlan(),
        paymentPlanType: state.plan,
      },
      theme: { color: '#071b32' },
      handler: async function (response) {
        try {
          const verified = await fetchJson(`${API}/payment/verify-draft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              draftToken: state.draftToken,
              courseId: selectedCourseId(),
            }),
          });
          if (verified.token) localStorage.setItem('naisft_token', verified.token);
          localStorage.removeItem('naisft_checkout_draft_token');
          showAlert('Payment successful. Admission record has been created.', 'success');
          setTimeout(() => { window.location.href = 'student-dashboard.html'; }, 1200);
        } catch (err) {
          showAlert(err.message || 'Payment received but verification failed. Please contact support.', 'error');
        }
      },
      modal: {
        ondismiss: function () {
          showAlert('Payment was not completed. You can try again whenever ready.', 'info');
          setBusy(false);
        },
      },
    });

    razorpay.open();
  }

  async function handlePayNow() {
    if (!validateAdmissionForm(true)) {
      showAlert('Please complete all required student details, document uploads and installment amount before payment.', 'error');
      updatePayButton();
      return;
    }

    try {
      setBusy(true);
      showAlert('Saving admission details...', 'info');
      await saveDraft();
      showAlert('Uploading admission documents...', 'info');
      const docs = await uploadDocuments();
      await saveDraft(docs);
      if (state.method === 'offline') {
        await submitOfflineRequest();
        return;
      }
      showAlert('Opening secure Razorpay payment window...', 'info');
      await startRazorpayPayment();
    } catch (err) {
      showAlert(err.message || 'Could not start checkout. Please try again.', 'error');
      setBusy(false);
    }
  }

  function selectPlan(plan) {
    state.plan = plan;
    if (state.plan === 'part' && el.firstInstallmentInput && !cleanAmount(el.firstInstallmentInput.value)) {
      el.firstInstallmentInput.value = String(minimumInstallment());
    }
    updatePricing();
  }

  function bindEvents() {
    el.planFull?.addEventListener('click', () => selectPlan('full'));
    el.planInstallment?.addEventListener('click', () => selectPlan('installment'));
    el.planOtherPart?.addEventListener('click', () => selectPlan('part'));
    el.firstInstallmentInput?.addEventListener('input', () => {
      el.firstInstallmentInput.value = el.firstInstallmentInput.value.replace(/[^\d]/g, '');
      updatePricing();
    });
    qsa('.method-card').forEach((card) => {
      card.addEventListener('click', () => {
        qsa('.method-card').forEach((item) => item.classList.remove('active'));
        card.classList.add('active');
        state.method = card.dataset.paymentMethod || 'online';
        if (el.offlineReferenceWrap) el.offlineReferenceWrap.style.display = state.method === 'offline' ? 'block' : 'none';
        updatePayButton();
      });
    });
    el.country?.addEventListener('change', () => {
      populateIdentityOptions();
      populateStateOptions();
    });
    el.addressState?.addEventListener('change', () => {
      const hiddenState = qs('#checkoutState');
      if (hiddenState) hiddenState.value = el.addressState.value;
      validateAdmissionForm();
      updatePayButton();
    });
    qsa('#admissionForm input,#admissionForm textarea,#admissionForm select').forEach((field) => {
      field.addEventListener('input', () => { validateAdmissionForm(); updatePayButton(); });
      field.addEventListener('change', () => { validateAdmissionForm(); updatePayButton(); });
    });
    documentInputs.forEach(([inputId, labelId]) => bindFileLabel(inputId, labelId));
    el.payBtn?.addEventListener('click', handlePayNow);
    qs('#couponBtn')?.addEventListener('click', () => showAlert('Coupon support can be connected after client finalizes coupon rules.', 'info'));
  }

  initPhonePicker();
  populateCountryOptions();
  populateStateOptions();
  populateIdentityOptions();
  bindEvents();
  loadCourse();
  updatePricing();
})();
