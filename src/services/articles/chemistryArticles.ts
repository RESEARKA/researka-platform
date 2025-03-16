import { Article } from '../articleTypes';

// Chemistry Articles
export const chemistryArticles: Article[] = [
  {
    id: "chem-001",
    title: "Catalytic Conversion of Carbon Dioxide to Methanol Using Novel Metal-Organic Framework Composites",
    abstract: "The efficient conversion of carbon dioxide to value-added chemicals represents a promising approach to mitigating greenhouse gas emissions while producing useful feedstocks for the chemical industry. This study reports the development of novel bimetallic metal-organic framework (MOF) composites that catalyze the hydrogenation of CO2 to methanol with unprecedented efficiency under mild conditions. Through systematic engineering of the MOF structure and metal centers, we achieved methanol selectivity exceeding 85% and stability over multiple reaction cycles.",
    fullText: `
Introduction:
The increasing atmospheric concentration of carbon dioxide (CO2) and its impact on global climate change have motivated extensive research into carbon capture, utilization, and storage (CCUS) technologies. Among various CO2 utilization strategies, the catalytic conversion of CO2 to methanol is particularly attractive as it produces a versatile liquid fuel and chemical feedstock while potentially contributing to a circular carbon economy (Li et al., 2023). However, the development of efficient catalysts for this transformation remains challenging due to the thermodynamic stability of CO2 and the multiple competing reaction pathways.

Metal-organic frameworks (MOFs), with their high surface area, tunable pore structure, and diverse metal centers, offer promising platforms for designing heterogeneous catalysts with precisely controlled active sites. Recent studies have demonstrated the potential of MOFs in CO2 reduction reactions, but challenges related to product selectivity, catalyst stability, and reaction efficiency under mild conditions persist.

This study reports the development of novel bimetallic MOF composites that effectively catalyze the hydrogenation of CO2 to methanol with high selectivity and stability. Through systematic engineering of the MOF structure, metal centers, and functional groups, we achieved significant improvements in catalytic performance compared to conventional catalysts.

Methods:
We synthesized a series of bimetallic MOF composites (M1-M2-MOF, where M1 = Cu, Ni, or Co and M2 = Ru, Pd, or Zn) using a one-pot hydrothermal method. The organic linkers were systematically varied to include carboxylate-based (BDC, BTC) and nitrogen-containing (BIM, DABCO) ligands. The resulting materials were characterized using powder X-ray diffraction (PXRD), nitrogen physisorption, scanning electron microscopy (SEM), transmission electron microscopy (TEM), X-ray photoelectron spectroscopy (XPS), and temperature-programmed desorption of CO2 (CO2-TPD).

Catalytic performance was evaluated in a high-pressure batch reactor system. Typically, 100 mg of catalyst was dispersed in 50 mL of solvent (water, methanol, or their mixture), and the reactor was pressurized with CO2 (20-40 bar) and H2 (10-60 bar). Reactions were conducted at temperatures ranging from 100-180°C for 2-12 hours. Products were analyzed using gas chromatography (GC) and high-performance liquid chromatography (HPLC). Isotopic labeling experiments using 13CO2 were performed to elucidate reaction mechanisms.

Results:
Among the various bimetallic MOF composites tested, Cu-Ru-BTC emerged as the most effective catalyst, achieving a methanol formation rate of 8.7 mmol g⁻¹ h⁻¹ at 150°C and 30 bar CO2/30 bar H2, with 87% selectivity toward methanol (the remaining products being primarily CO and formic acid). This performance represents a 3.2-fold improvement in activity and a 1.5-fold enhancement in selectivity compared to the benchmark Cu/ZnO/Al2O3 industrial catalyst tested under identical conditions.

Detailed characterization revealed that the Cu-Ru-BTC catalyst features well-dispersed bimetallic nanoparticles (2-5 nm) embedded within the MOF structure. XPS analysis indicated the presence of partially reduced Cu⁺ species alongside metallic Cu⁰ and Ru⁰, with the Cu⁺/Cu⁰ ratio correlating positively with methanol selectivity. CO2-TPD measurements demonstrated strong CO2 adsorption on the catalyst surface, with multiple binding sites corresponding to different activation modes.

The incorporation of nitrogen-containing ligands in the MOF structure significantly enhanced catalyst performance. For instance, replacing BTC with BIM ligands in the Cu-Ru system increased the methanol formation rate by 35%, which we attribute to the improved stabilization of key reaction intermediates by the basic nitrogen sites. Similarly, introducing DABCO as a secondary ligand created hierarchical porosity in the MOF structure, improving mass transport properties and resulting in a 28% increase in catalytic activity.

Isotopic labeling studies using 13CO2 confirmed that methanol formation proceeds primarily through a formate intermediate pathway. The rate-determining step was identified as the hydrogenation of formate species, based on kinetic isotope effect measurements using H2/D2. Interestingly, the bimetallic MOF catalysts exhibited significantly lower activation energy for this step (62 kJ/mol) compared to conventional Cu-based catalysts (89 kJ/mol), explaining their enhanced activity at lower temperatures.

Stability tests demonstrated that the Cu-Ru-BTC catalyst maintained over 90% of its initial activity after five consecutive reaction cycles (total TOS > 60 hours). Post-reaction characterization showed minimal changes in the MOF structure and metal nanoparticle size distribution, indicating excellent structural stability under reaction conditions. This stability is attributed to the strong metal-support interactions and the protective environment provided by the MOF framework.

Discussion:
The exceptional performance of our bimetallic MOF composites can be attributed to several synergistic factors. First, the bimetallic active sites facilitate the tandem activation of CO2 and H2, with Ru primarily responsible for H2 dissociation while Cu sites participate in CO2 activation and the subsequent hydrogenation steps. This cooperative effect is evidenced by the significantly higher activity of bimetallic catalysts compared to their monometallic counterparts.

Second, the MOF structure provides a well-defined environment for controlling the local coordination and electronic properties of the metal centers. The presence of oxygen and nitrogen donor atoms from the organic linkers modulates the electron density at the metal sites, favoring the formation and stabilization of key reaction intermediates. This is particularly important for stabilizing the formate intermediate and facilitating its subsequent hydrogenation to methanol.

Third, the hierarchical pore structure of the optimized MOF composites enables efficient mass transport while maintaining high surface area and active site density. The combination of micropores (from the intrinsic MOF structure) and mesopores (created through ligand engineering) allows for rapid diffusion of reactants and products while providing confinement effects that enhance reaction selectivity.

The improved performance at lower temperatures (120-150°C vs. 220-300°C for conventional catalysts) is particularly significant from an energy efficiency perspective. The ability to operate under milder conditions not only reduces energy consumption but also minimizes side reactions and catalyst deactivation, contributing to the excellent stability observed in our systems.

Conclusion:
This study presents a series of novel MOF-based composite catalysts that demonstrate exceptional activity and selectivity for the conversion of CO2 to methanol under mild conditions. The rational design approach employed here, combining different metals and functional organic linkers, provides a versatile platform for developing efficient catalysts for CO2 utilization. These findings contribute to the ongoing efforts to develop sustainable technologies for mitigating carbon emissions while producing valuable chemical feedstocks.
    `,
    authors: [
      {
        id: "auth-4001",
        name: "Dr. Yusuf Rahman",
        institution: "Department of Chemical Engineering, Massachusetts Institute of Technology",
        email: "yrahman@mit.edu",
        orcid: "0000-0002-1478-5209"
      },
      {
        id: "auth-4002",
        name: "Prof. Aisha Nakamura",
        institution: "Institute for Integrated Cell-Material Sciences, Kyoto University",
        email: "a.nakamura@icems.kyoto-u.ac.jp",
        orcid: "0000-0003-4526-7120"
      },
      {
        id: "auth-4003",
        name: "Dr. Marcus Vetter",
        institution: "Max Planck Institute for Chemical Energy Conversion",
        email: "m.vetter@cec.mpg.de",
        orcid: "0000-0001-9237-8124"
      }
    ],
    publishedDate: "2025-02-18",
    category: "Chemistry",
    keywords: ["carbon dioxide conversion", "methanol synthesis", "metal-organic frameworks", "heterogeneous catalysis", "bimetallic catalysts", "CO2 utilization"],
    citations: 7,
    views: 612,
    doi: "10.1021/jacs.5b01234"
  },
  {
    id: "chem-002",
    title: "Total Synthesis of Marinomycin A via Biomimetic Macrocyclization",
    abstract: "Marinomycin A, a complex polyene macrodiolide natural product with promising antibiotic and anticancer properties, has remained a challenging synthetic target due to its intricate structure featuring a dimeric architecture and sensitive polyene system. This paper reports the first enantioselective total synthesis of marinomycin A, employing a novel biomimetic macrocyclization strategy. Our approach features a key late-stage dimerization of monomeric precursors, enabling efficient access to this structurally complex natural product and setting the stage for the preparation of structural analogs with improved pharmacological properties.",
    fullText: `
Introduction:
Natural products continue to serve as invaluable sources of inspiration for drug discovery, providing unique structural scaffolds and biological activities that often cannot be readily accessed through conventional medicinal chemistry approaches. Marinomycin A, isolated from the marine actinomycete Marinispora CNQ-140, represents a particularly intriguing example, featuring a complex macrodiolide structure with promising antibiotic activity against methicillin-resistant Staphylococcus aureus (MRSA) and vancomycin-resistant Enterococcus faecium, as well as selective cytotoxicity against melanoma cell lines (Kwon et al., 2021).

The structural complexity of marinomycin A, characterized by a dimeric architecture containing two identical polyene-polyol monomeric units connected through a macrodiolide linkage, has made it a formidable synthetic challenge. Previous synthetic efforts have been hampered by the sensitivity of the conjugated polyene system to light, oxygen, and acidic conditions, as well as the difficulties associated with the stereoselective construction of the eight stereogenic centers present in each monomeric unit.

This paper reports the first enantioselective total synthesis of marinomycin A, employing a biomimetic approach that mimics the proposed biosynthetic pathway. Our strategy features a convergent assembly of the monomeric precursor followed by a late-stage dimerization and macrocyclization sequence, enabling efficient access to this structurally complex natural product.

Methods:
Our synthetic approach began with the development of a scalable route to the monomeric precursor of marinomycin A. The polyol segment containing five contiguous stereogenic centers was constructed using a catalytic asymmetric aldol methodology developed in our laboratory, employing a novel chiral copper(II) complex with a tridentate bis(oxazoline) ligand. This approach provided the required aldol adducts with excellent enantioselectivity (>95% ee) and diastereoselectivity (>20:1 dr).

The polyene segment was assembled through a sequence of stereoselective Horner-Wadsworth-Emmons (HWE) olefinations using phosphonate reagents with modified reaction conditions to ensure high E-selectivity. A critical aspect of our approach was the development of conditions that minimized isomerization of the sensitive polyene system. This was achieved through the use of mild reaction conditions (KHMDS, 18-crown-6, -78°C) and the rigorous exclusion of light and oxygen throughout the synthetic sequence.

The coupling of the polyol and polyene segments was accomplished through a stereoselective aldol reaction, followed by careful functional group manipulations to install the requisite carboxylic acid and alcohol functionalities needed for the subsequent macrocyclization. Extensive optimization was required to identify conditions that would preserve the integrity of the polyene system during these transformations.

For the key dimerization and macrocyclization sequence, we explored various strategies including double esterification approaches and sequential esterification-macrolactonization pathways. After extensive experimentation, we identified a modified Shiina protocol using 2-methyl-6-nitrobenzoic anhydride (MNBA) with DMAP in highly diluted dichloromethane as optimal for achieving the desired transformation in a single operation. This approach provided the protected marinomycin A in 32% yield, which was subsequently deprotected using HF·pyridine complex to afford the natural product.

Throughout the synthesis, specialized handling techniques were employed to minimize degradation of the light and oxygen-sensitive intermediates. These included the use of amber glassware, low-temperature storage, and the addition of BHT as a radical scavenger in all chromatographic purifications.

Results:
The synthesis of the monomeric precursor was accomplished in 18 steps from commercially available starting materials, with an overall yield of 7.2%. The stereoselective construction of the polyene system was achieved with excellent E/Z selectivity (>20:1) using our modified HWE reaction conditions. The eight stereogenic centers were established with high enantioselectivity (>95% ee for each center) as confirmed by chiral HPLC analysis of key intermediates.

The critical dimerization and macrocyclization sequence was successfully executed using modified Shiina conditions (2-methyl-6-nitrobenzoic anhydride, DMAP, triethylamine) in highly diluted dichloromethane (0.5 mM) at 0°C, affording the protected marinomycin A in 32% yield. Global deprotection using HF·pyridine complex provided the target natural product in 85% yield for this final step.

Spectroscopic data (1H and 13C NMR, HRMS, IR, and optical rotation) of the synthetic marinomycin A were in excellent agreement with those reported for the natural product, confirming the structural assignment. X-ray crystallographic analysis of a p-bromobenzoate derivative of a key intermediate confirmed the absolute configuration of the stereogenic centers.

Biological evaluation of the synthetic material demonstrated antimicrobial and cytotoxic activities identical to those reported for the natural product. Notably, our synthetic marinomycin A exhibited potent activity against MRSA (MIC = 0.13 μg/mL) and melanoma cell lines (IC50 = 0.4-0.9 μM against several melanoma lines), with significantly lower cytotoxicity against non-transformed cells.

Discussion:
The successful total synthesis of marinomycin A represents a significant achievement in complex natural product synthesis, overcoming numerous challenges associated with the construction of the sensitive polyene system and the intricate macrodiolide architecture. Our biomimetic approach, featuring a late-stage dimerization and macrocyclization, proved highly effective for accessing this complex natural product.

Several aspects of our synthetic strategy merit further discussion. First, the development of highly stereoselective methods for constructing the polyol and polyene segments was crucial for the success of the synthesis. The catalytic asymmetric aldol methodology developed in our laboratory provided an efficient means of establishing the required stereochemistry in the polyol segment, while our modified HWE olefination conditions enabled the stereoselective construction of the sensitive polyene system.

Second, the successful execution of the key dimerization and macrocyclization sequence demonstrates the viability of biomimetic approaches for constructing complex natural product architectures. The efficiency of this transformation (32% yield for the formation of two ester bonds and a 38-membered macrocycle) is particularly noteworthy given the complexity of the system.

Third, the development of specialized handling techniques for managing the light and oxygen sensitivity of the polyene intermediates was essential for the success of the synthesis. These approaches may find broader application in the synthesis of other sensitive polyene natural products.

From a biological perspective, the availability of synthetic marinomycin A opens new opportunities for exploring the therapeutic potential of this promising natural product. The demonstrated activity against MRSA and melanoma cell lines, coupled with the relatively low cytotoxicity against non-transformed cells, suggests that marinomycin A may serve as a valuable lead compound for the development of new antibiotics and anticancer agents.

Conclusion:
We have developed the first enantioselective total synthesis of marinomycin A, employing a novel biomimetic macrocyclization strategy. Our approach features a key late-stage dimerization of monomeric precursors, enabling efficient access to this structurally complex natural product. The synthetic material exhibited biological activities identical to those of the natural product, confirming both the structural assignment and the potential of marinomycin A as a lead compound for antibiotic and anticancer drug development. The synthetic route described herein provides a platform for the preparation of structural analogs that may address the pharmacological limitations of the natural product.
    `,
    authors: [
      {
        id: "auth-5001",
        name: "Prof. Sarah J. Meisner",
        institution: "Department of Chemistry, Stanford University",
        email: "s.meisner@stanford.edu",
        orcid: "0000-0003-2471-8259"
      },
      {
        id: "auth-5002",
        name: "Dr. Rajiv Chandrasekhar",
        institution: "Department of Medicinal Chemistry, University of Washington",
        email: "rajiv.c@uw.edu",
        orcid: "0000-0001-8943-7256"
      },
      {
        id: "auth-5003",
        name: "Dr. Lukas Schmidt",
        institution: "Institute of Organic Chemistry, ETH Zurich",
        email: "l.schmidt@org.chem.ethz.ch",
        orcid: "0000-0002-9517-3842"
      }
    ],
    publishedDate: "2025-01-05",
    category: "Chemistry",
    keywords: ["total synthesis", "natural products", "macrocyclization", "polyene macrolides", "marinomycin", "antibiotics", "anticancer agents"],
    citations: 13,
    views: 728,
    doi: "10.1021/jacs.5b02468"
  },
  {
    id: "chem-003",
    title: "Sustainable Synthesis of Biodegradable Polyesters from Lignocellulosic Biomass via Ionic Liquid Pretreatment and Enzymatic Polymerization",
    abstract: "The development of sustainable pathways for converting biomass into biodegradable polymers represents a promising approach to addressing plastic pollution while reducing dependence on fossil resources. This study reports an integrated process for the conversion of lignocellulosic biomass into high-performance biodegradable polyesters. Using ionic liquid pretreatment to fractionate biomass components followed by oxidative depolymerization and enzymatic polymerization, we produced polyesters with tunable properties and excellent biodegradability. Life cycle assessment demonstrates significant environmental benefits compared to conventional petroleum-based polymers.",
    fullText: `
Introduction:
The environmental challenges associated with conventional plastics, including resource depletion, greenhouse gas emissions, and persistent pollution, have intensified the search for sustainable alternatives derived from renewable resources. Biodegradable polyesters represent a promising class of materials that can address these concerns, provided they can be produced from abundant non-food biomass using environmentally benign processes (Zhu et al., 2023).

Lignocellulosic biomass, comprising cellulose, hemicellulose, and lignin, represents the most abundant renewable carbon source on Earth. However, its recalcitrant structure presents significant challenges for conversion into value-added products. Traditional biomass processing methods often involve harsh conditions and environmentally problematic chemicals, undermining the sustainability benefits of the resulting materials.

This study reports the development of an integrated process for converting lignocellulosic biomass into biodegradable polyesters, combining the advantages of ionic liquid pretreatment, selective oxidative depolymerization, and enzymatic polymerization. This approach enables the production of polyesters with tunable properties while adhering to green chemistry principles and maintaining a favorable environmental footprint.

Methods:
Our process began with the pretreatment of lignocellulosic biomass (corn stover, switchgrass, and pine sawdust) using the ionic liquid 1-ethyl-3-methylimidazolium acetate ([EMIM][OAc]). This step was conducted at 120°C for 3 hours with 10% biomass loading, resulting in the dissolution of cellulose and hemicellulose while precipitating lignin. The fractionated components were recovered through selective precipitation using antisolvents (water for lignin, ethanol for cellulose).

The cellulose and hemicellulose fractions were subjected to oxidative depolymerization using a catalytic system comprising 2,2,6,6-tetramethylpiperidine-1-oxyl (TEMPO) and sodium hypochlorite, with sodium bromide as a co-catalyst. This reaction was performed under mild conditions (pH 10, 25°C) to produce dicarboxylic acids of varying chain lengths (C2-C6). The product distribution was controlled by adjusting reaction parameters, particularly the oxidant concentration and reaction time.

The lignin fraction was valorized through a base-catalyzed depolymerization process using NaOH in supercritical methanol (280°C, 30 min), yielding aromatic monomers including vanillic acid, syringic acid, and 4-hydroxybenzoic acid. These aromatic building blocks were incorporated as comonomers in subsequent polymerization reactions to enhance the mechanical properties of the resulting polymers.

Enzymatic polymerization was performed using immobilized Candida antarctica lipase B (CALB) as a catalyst, with the dicarboxylic acids and bio-based diols (1,3-propanediol and 1,4-butanediol produced from glycerol and succinic acid, respectively) as monomers. Polymerizations were conducted in diphenyl ether at 70°C under vacuum (10 mbar) to remove the water byproduct and drive the reaction to high conversion. Various polymer compositions were prepared by adjusting the monomer ratios and incorporating the lignin-derived aromatic comonomers.

The resulting polyesters were characterized using gel permeation chromatography (GPC), nuclear magnetic resonance (NMR) spectroscopy, differential scanning calorimetry (DSC), thermogravimetric analysis (TGA), and mechanical testing. Biodegradability was assessed through soil burial tests and enzymatic degradation assays using lipases. The environmental impact of the entire process was evaluated using life cycle assessment (LCA) methodology.

Results:
The fractionation of lignocellulosic biomass using [EMIM][OAc] achieved high dissolution efficiency, with 85-92% of cellulose and 78-83% of hemicellulose recovered in the soluble fraction. The oxidative depolymerization process converted these carbohydrates into dicarboxylic acids with yields of 62-68% based on the carbohydrate content of the original biomass.

The enzymatic polymerization of the bio-based monomers proceeded with high efficiency, achieving number-average molecular weights (Mn) of 25,000-45,000 g/mol depending on the monomer composition. The polyesters exhibited glass transition temperatures (Tg) ranging from -25°C to 15°C and melting temperatures (Tm) between 45°C and 120°C, with crystallinity varying from 15% to 45%. Incorporation of the lignin-derived aromatic comonomers (5-15 mol%) increased the Tg and tensile strength while reducing crystallinity.

Mechanical properties of the polyesters were tunable based on composition, with tensile strengths ranging from 10 to 35 MPa, elongation at break from 150% to 400%, and Young's moduli from 150 to 500 MPa. These properties are comparable to those of commercial biodegradable polyesters such as poly(butylene succinate) (PBS) and certain grades of poly(lactic acid) (PLA).

Biodegradability testing demonstrated complete degradation of the polyesters in soil within 3-6 months, with degradation rates influenced by crystallinity and aromatic content. Enzymatic degradation studies showed that lipases effectively catalyzed the hydrolysis of the ester bonds, with degradation rates correlating inversely with crystallinity and the content of aromatic comonomers.

Life cycle assessment revealed significant environmental benefits compared to petroleum-based polymers. The biomass-derived polyesters showed 60-75% lower greenhouse gas emissions, 40-55% reduction in non-renewable energy use, and 45-60% decrease in ecotoxicity impacts compared to polyethylene terephthalate (PET). The use of ionic liquids contributed significantly to the environmental impact, but this was partially offset by the high efficiency of the process and the potential for ionic liquid recycling (demonstrated for up to 5 cycles with minimal loss of efficiency).

Discussion:
The integrated process developed in this study addresses several key challenges in the sustainable production of biodegradable polymers from lignocellulosic biomass. The ionic liquid pretreatment enables efficient fractionation of biomass components under relatively mild conditions, avoiding the harsh acids or bases typically used in conventional processes. This approach not only improves the efficiency of subsequent conversion steps but also enables the valorization of all major biomass components.

The oxidative depolymerization strategy provides a direct route from carbohydrates to dicarboxylic acid monomers, bypassing the need for fermentation or other biological processes that often suffer from low yields and product inhibition. The mild conditions employed (ambient temperature, aqueous medium) align with green chemistry principles and minimize energy requirements.

The enzymatic polymerization represents a particularly sustainable approach to polymer synthesis, operating under mild conditions with high catalytic efficiency and specificity. The absence of metal catalysts, toxic solvents, or harsh reagents enhances the environmental credentials of the process and simplifies downstream purification. The ability to produce polyesters with molecular weights comparable to those of commercial polymers demonstrates the viability of this approach for practical applications.

The tunable properties of the resulting polyesters, achieved through variation in monomer composition and incorporation of lignin-derived aromatics, enable the tailoring of materials for specific applications. This versatility is crucial for the development of bio-based alternatives that can match the performance of conventional plastics across diverse use cases.

The demonstrated biodegradability of the polyesters addresses the end-of-life challenges associated with conventional plastics. The correlation between structure and degradation rate provides a basis for designing materials with predetermined lifespans, balancing durability during use with degradability after disposal.

The favorable life cycle assessment results confirm the environmental benefits of the developed process, though they also highlight the importance of ionic liquid recycling for minimizing the overall impact. The potential for further optimization, particularly in terms of process integration and energy efficiency, suggests that additional environmental improvements are achievable.

Conclusion:
This study demonstrates a sustainable approach to converting lignocellulosic biomass into biodegradable polyesters with tunable properties. By integrating ionic liquid pretreatment, selective oxidative depolymerization, and enzymatic polymerization, we have developed a process that adheres to green chemistry principles while producing materials with performance comparable to conventional plastics. The demonstrated biodegradability and favorable life cycle assessment results highlight the potential of this approach for addressing the environmental challenges associated with plastic production and waste management. Future work will focus on scaling up the process, optimizing energy efficiency, and exploring additional applications for these sustainable materials.
    `,
    authors: [
      {
        id: "auth-6001",
        name: "Dr. Elena Rodríguez-García",
        institution: "Department of Chemical Engineering, University of California, Berkeley",
        email: "e.rodriguez-garcia@berkeley.edu",
        orcid: "0000-0002-8735-4429"
      },
      {
        id: "auth-6002",
        name: "Prof. Tao Zhang",
        institution: "State Key Laboratory of Catalysis, Dalian Institute of Chemical Physics",
        email: "taozhang@dicp.ac.cn",
        orcid: "0000-0003-4217-3562"
      },
      {
        id: "auth-6003",
        name: "Dr. Annika Malmström",
        institution: "Department of Fibre and Polymer Technology, KTH Royal Institute of Technology",
        email: "annika.malmstrom@kth.se",
        orcid: "0000-0001-5692-8376"
      }
    ],
    publishedDate: "2025-03-12",
    category: "Chemistry",
    keywords: ["biodegradable polymers", "lignocellulosic biomass", "ionic liquids", "enzymatic polymerization", "sustainable chemistry", "polyesters", "biomass valorization"],
    citations: 4,
    views: 389,
    doi: "10.1021/acssuschemeng.5b00721"
  }
];
