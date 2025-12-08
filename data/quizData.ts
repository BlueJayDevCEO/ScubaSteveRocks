import { GameRound } from '../types';

export const QUIZ_DATA: Record<string, GameRound[]> = {
    marine_life: [
        {
            title: "Coral Biology",
            scenario: "You are looking closely at a coral reef. Your buddy asks if the coral structure is a rock, a plant, or an animal.",
            options: ["A. It's a rock", "B. It's a plant", "C. It's a colony of animals", "D. It's a mineral deposit"],
            correct_answer: "C. It's a colony of animals",
            explanation: "Corals are colonies of tiny animals called polyps. While they have algae living inside them (plants) and build a limestone skeleton (rock-like), they are biologically animals.",
            xp_reward: 20
        },
        {
            title: "The Gender-Bending Fish",
            scenario: "You spot a pair of Clownfish in an anemone. The larger female disappears. What happens to the remaining male?",
            options: ["A. He finds a new female", "B. He remains alone", "C. He changes sex to become female", "D. He leaves the anemone"],
            correct_answer: "C. He changes sex to become female",
            explanation: "Clownfish are born male. If the dominant female dies, the largest male will irreversibly change sex to take her place.",
            xp_reward: 25
        },
        {
            title: "Turtle ID",
            scenario: "You see a sea turtle with a jagged, saw-like shell edge and two pairs of scales between its eyes.",
            options: ["A. Green Turtle", "B. Hawksbill Turtle", "C. Leatherback Turtle", "D. Loggerhead Turtle"],
            correct_answer: "B. Hawksbill Turtle",
            explanation: "The serrated shell margin and two pairs of prefrontal scales are key identifiers of the Hawksbill Turtle.",
            xp_reward: 30
        },
        {
            title: "Octopus Hearts",
            scenario: "You encounter an Octopus moving across the reef. How many hearts is it using to pump blue blood through its body?",
            options: ["A. One", "B. Two", "C. Three", "D. Four"],
            correct_answer: "C. Three",
            explanation: "Octopuses have three hearts: two pump blood to the gills, and one pumps it to the rest of the body.",
            xp_reward: 25
        },
        {
            title: "Shark Respiration",
            scenario: "You see a Nurse Shark resting on the sand, not swimming. How is it breathing?",
            options: ["A. It is holding its breath", "B. Buccal Pumping", "C. Ram Ventilation", "D. Osmosis"],
            correct_answer: "B. Buccal Pumping",
            explanation: "Nurse sharks can actively pump water over their gills using cheek muscles (buccal pumping), allowing them to rest on the bottom.",
            xp_reward: 20
        },
        {
            title: "Manta Ray Feeding",
            scenario: "You observe several Reef Mantas looping in circles near the surface with mouths wide open.",
            options: ["A. Sleeping", "B. Mating", "C. Barrel-feeding", "D. Defending territory"],
            correct_answer: "C. Barrel-feeding",
            explanation: "Mantas often engage in 'barrel rolls' to stay inside dense patches of plankton during feeding.",
            xp_reward: 25
        },
        {
            title: "Moray Eel Behavior",
            scenario: "You see a Green Moray opening and closing its mouth repeatedly. What is it doing?",
            options: ["A. Threat display", "B. Breathing", "C. Calling a mate", "D. Swallowing prey"],
            correct_answer: "B. Breathing",
            explanation: "Morays pump water over their gills by opening and closing their mouths. This is normal behavior, not aggression.",
            xp_reward: 20
        },
        {
            title: "Parrotfish Sand",
            scenario: "You notice fine white sand accumulating beneath a feeding Parrotfish. Why?",
            options: ["A. It's scratching algae", "B. It's digesting coral into sand", "C. It's releasing eggs", "D. It's injured"],
            correct_answer: "B. It's digesting coral into sand",
            explanation: "Parrotfish break down coral skeletons while feeding on algae, producing sand as waste.",
            xp_reward: 30
        },
        {
            title: "Dolphin Sleep",
            scenario: "You encounter a pod of Dolphins swimming slowly in a tight circle.",
            options: ["A. They are feeding", "B. They are resting with half their brain asleep", "C. They are chasing prey", "D. They are migrating"],
            correct_answer: "B. They are resting with half their brain asleep",
            explanation: "Dolphins use unihemispheric sleep, where one brain hemisphere rests while the other keeps them moving.",
            xp_reward: 35
        },
        {
            title: "Lionfish Invasion",
            scenario: "You see a Lionfish in the Caribbean. How did it most likely get there?",
            options: ["A. Natural migration", "B. Released aquarium fish", "C. Storm displacement", "D. Ship ballast"],
            correct_answer: "B. Released aquarium fish",
            explanation: "Lionfish were introduced by aquarium releases in the 1980s and have since become an invasive species in the Atlantic and Caribbean.",
            xp_reward: 25
        },
        {
            title: "Cleaning Stations",
            scenario: "You see a big Grouper hovering still while tiny Wrasses pick at its skin and inside its mouth.",
            options: ["A. Territorial fight", "B. Sleeping", "C. Being cleaned at a cleaning station", "D. Preparing to spawn"],
            correct_answer: "C. Being cleaned at a cleaning station",
            explanation: "Cleaner fish remove parasites and dead tissue from larger 'client' fish at dedicated cleaning stations.",
            xp_reward: 30
        },
        {
            title: "Camouflage Master",
            scenario: "You almost place your hand on what you thought was a rock, but it suddenly moves and jets away with a cloud of ink.",
            options: ["A. Cuttlefish", "B. Octopus", "C. Squid", "D. Stonefish"],
            correct_answer: "B. Octopus",
            explanation: "Octopuses are famous for incredible camouflage and can release ink to confuse predators as they escape.",
            xp_reward: 25
        }
    ],
    safety: [
        {
            title: "Out of Air",
            scenario: "You are at 15 meters. You check your gauge and realize you are completely out of air. Your buddy is 2 meters away.",
            options: ["A. Perform a CESA", "B. Signal 'Out of Air' and share air", "C. Drop weights and ascend", "D. Swim to the surface immediately"],
            correct_answer: "B. Signal 'Out of Air' and share air",
            explanation: "Since your buddy is close, sharing air (alternate air source) is the safest and primary response to an out-of-air emergency.",
            xp_reward: 50
        },
        {
            title: "Ascent Rate",
            scenario: "You are ending your dive. What is the generally accepted maximum ascent rate?",
            options: ["A. 30 meters per minute", "B. 18 meters per minute", "C. 9 meters per minute", "D. As fast as your bubbles"],
            correct_answer: "B. 18 meters per minute",
            explanation: "Most agencies (PADI/SSI) recommend a maximum ascent rate of 18m/60ft per minute, though diving computers often suggest even slower (9m/min).",
            xp_reward: 20
        },
        {
            title: "The Safety Stop",
            scenario: "You are finishing a dive to 20 meters. Where should you perform your safety stop?",
            options: ["A. 3 meters for 5 minutes", "B. 5 meters for 3 minutes", "C. 10 meters for 1 minute", "D. At the surface"],
            correct_answer: "B. 5 meters for 3 minutes",
            explanation: "The standard precautionary safety stop is at 5 meters (15 feet) for at least 3 minutes to allow for off-gassing.",
            xp_reward: 15
        },
        {
            title: "Lost Buddy",
            scenario: "Visibility is poor and you lose sight of your buddy. What is the correct procedure?",
            options: ["A. Continue the dive alone", "B. Search for 1 minute, then ascend", "C. Go immediately to the surface", "D. Wait at the bottom for them"],
            correct_answer: "B. Search for 1 minute, then ascend",
            explanation: "The standard lost buddy procedure is to search for no more than one minute, then surface safely to reunite.",
            xp_reward: 35
        },
        {
            title: "Nitrogen Narcosis",
            scenario: "At 30 meters, your buddy starts acting confused and slow, making silly decisions.",
            options: ["A. Take photos of them", "B. Ascend a few meters with them", "C. Give them your alternate air source", "D. End the dive immediately with a rapid ascent"],
            correct_answer: "B. Ascend a few meters with them",
            explanation: "Ascending 3–5 meters reduces narcosis symptoms quickly by reducing nitrogen partial pressure, while keeping the ascent controlled.",
            xp_reward: 40
        },
        {
            title: "Computer Failure",
            scenario: "Your dive computer goes completely blank mid-dive and does not turn back on.",
            options: ["A. Ignore it and continue", "B. End the dive and make a normal, slow ascent with a safety stop", "C. Immediately rocket to the surface", "D. Dive deeper to see if it comes back"],
            correct_answer: "B. End the dive and make a normal, slow ascent with a safety stop",
            explanation: "Without depth and time information, you should end the dive conservatively and avoid further dives until the issue is resolved.",
            xp_reward: 35
        },
        {
            title: "Weightbelt Emergency",
            scenario: "Your buddy is sinking uncontrollably after losing buoyancy and seems unresponsive.",
            options: ["A. Swim away and get help", "B. Add air to your own BCD", "C. Drop their weights immediately", "D. Signal them to swim up"],
            correct_answer: "C. Drop their weights immediately",
            explanation: "Dropping weights gives instant positive buoyancy and can be a lifesaving action in an emergency.",
            xp_reward: 50
        },
        {
            title: "Boat Traffic at Surface",
            scenario: "You surface far from the boat and hear loud engines close by. You have a surface marker buoy (SMB).",
            options: ["A. Swim fast towards the boat", "B. Descend a few meters and wait while deploying the SMB line", "C. Shout and wave only", "D. Remove your fins to swim better"],
            correct_answer: "B. Descend a few meters and wait while deploying the SMB line",
            explanation: "Being just below the surface protects you from propellers while the SMB marks your position for the boat.",
            xp_reward: 30
        },
        {
            title: "Cold Stress",
            scenario: "Your buddy is shivering underwater and seems distracted, even though there’s still planned bottom time left.",
            options: ["A. Continue the dive as planned", "B. Ask if they’re ok and keep going", "C. Signal to ascend and end the dive early", "D. Give them extra weight"],
            correct_answer: "C. Signal to ascend and end the dive early",
            explanation: "Cold stress increases gas consumption and decompression risk; ending the dive early is the safest option.",
            xp_reward: 25
        }
    ],
    equipment: [
        {
            title: "Tank Valve",
            scenario: "You are setting up your gear. What is the purpose of the O-ring on the tank valve?",
            options: ["A. To look nice", "B. To create an air-tight seal", "C. To measure pressure", "D. To filter the air"],
            correct_answer: "B. To create an air-tight seal",
            explanation: "The O-ring creates a high-pressure seal between the tank valve and the first stage regulator.",
            xp_reward: 15
        },
        {
            title: "First Stage",
            scenario: "What does the First Stage of your regulator actually do?",
            options: ["A. Delivers air to your mouth", "B. Reduces tank pressure to intermediate pressure", "C. Holds the mouthpiece", "D. Measures depth"],
            correct_answer: "B. Reduces tank pressure to intermediate pressure",
            explanation: "The first stage reduces high tank pressure (e.g., 200 bar) to an intermediate pressure (approx 10 bar) for the second stage to use.",
            xp_reward: 30
        },
        {
            title: "BCD Failure",
            scenario: "Your low-pressure inflator hose disconnects underwater. How do you add air to your BCD?",
            options: ["A. You cannot", "B. Swim up to expand the air", "C. Orally inflate it", "D. Use your buddy's BCD"],
            correct_answer: "C. Orally inflate it",
            explanation: "You can manually blow air into the BCD by pressing the deflate button while exhaling into the mouthpiece.",
            xp_reward: 40
        },
        {
            title: "Tank Materials",
            scenario: "You notice two tanks: one is steel, one is aluminum. Which is naturally more buoyant near the end of the dive?",
            options: ["A. Steel tank", "B. Aluminum tank", "C. Both the same", "D. Depends on water temperature"],
            correct_answer: "B. Aluminum tank",
            explanation: "Aluminum tanks often become slightly positively buoyant when close to empty, while steel tanks generally remain negative.",
            xp_reward: 25
        },
        {
            title: "SPG Reading Drop",
            scenario: "Your SPG suddenly drops from 120 bar to 0 bar, but you are still breathing normally from the regulator.",
            options: ["A. Your tank is empty", "B. The SPG or its hose has failed", "C. You are hallucinating", "D. Your buddy is stealing your air"],
            correct_answer: "B. The SPG or its hose has failed",
            explanation: "A sudden drop with normal breathing usually indicates a gauge or hose failure, not an empty tank. End the dive safely.",
            xp_reward: 35
        },
        {
            title: "Reg Freeflow",
            scenario: "At the surface, your second stage begins to freeflow heavily and won’t stop.",
            options: ["A. Put it in your mouth and breathe from it", "B. Turn the tank valve off briefly, then on again", "C. Hit it hard on the boat ladder", "D. Jump back in the water"],
            correct_answer: "B. Turn the tank valve off briefly, then on again",
            explanation: "Shutting down and reopening the valve can sometimes reset a freeflow, but the regulator should be checked by a technician.",
            xp_reward: 30
        },
        {
            title: "Weights Placement",
            scenario: "Where is the safest primary place to carry most of your weight when using a standard recreational setup?",
            options: ["A. On your ankles", "B. In your BCD trim pockets only", "C. On a releasable weightbelt or integrated weight pockets", "D. In your pockets"],
            correct_answer: "C. On a releasable weightbelt or integrated weight pockets",
            explanation: "Weights should be quickly releasable in an emergency to establish positive buoyancy.",
            xp_reward: 20
        },
        {
            title: "Alternate Air Source",
            scenario: "In a standard recreational configuration, where should your alternate air source (octopus) be clipped?",
            options: ["A. Dragging behind you", "B. Tucked inside your wetsuit", "C. In the triangle between chin and ribcage, clearly visible and accessible", "D. In your BCD pocket"],
            correct_answer: "C. In the triangle between chin and ribcage, clearly visible and accessible",
            explanation: "The alternate air source must be easy to find and deploy quickly in an emergency.",
            xp_reward: 25
        }
    ],
    environment: [
        {
            title: "Reef Etiquette",
            scenario: "You see a photographer holding onto a piece of coral to steady their shot. What should you do?",
            options: ["A. Do nothing", "B. Copy them", "C. Gently signal them to let go", "D. Pull them off aggressively"],
            correct_answer: "C. Gently signal them to let go",
            explanation: "Touching coral damages the delicate polyps and removes protective mucus. Polite intervention helps protect the reef.",
            xp_reward: 20
        },
        {
            title: "Buoyancy Control",
            scenario: "Why is neutral buoyancy important for the environment?",
            options: ["A. It looks cool", "B. It prevents accidental contact with the reef", "C. It saves air", "D. It keeps you warm"],
            correct_answer: "B. It prevents accidental contact with the reef",
            explanation: "Good buoyancy prevents divers from crashing into the reef, kicking up sand onto corals, or disturbing marine life.",
            xp_reward: 20
        },
        {
            title: "Fin Kicks Near the Bottom",
            scenario: "You are swimming just above a sandy bottom, and your fins keep stirring up clouds of sand.",
            options: ["A. It's normal and harmless", "B. It only affects visibility", "C. It can smother coral and marine life when sand settles", "D. It scares fish away only"],
            correct_answer: "C. It can smother coral and marine life when sand settles",
            explanation: "Silt and sand can settle on corals and other organisms, blocking light and causing stress or death.",
            xp_reward: 25
        },
        {
            title: "Feeding Fish",
            scenario: "A diver offers you bread to feed the reef fish for better photos.",
            options: ["A. Accept and feed the fish", "B. Decline and explain why it's harmful", "C. Throw the bread away underwater", "D. Hide it in your BCD"],
            correct_answer: "B. Decline and explain why it's harmful",
            explanation: "Feeding fish changes their natural behavior, diet, and can disrupt the ecosystem balance.",
            xp_reward: 30
        },
        {
            title: "Touching Marine Life",
            scenario: "You see a turtle resting calmly on the reef and your buddy wants to touch its shell.",
            options: ["A. It's fine if you're gentle", "B. Only touch if the guide says yes", "C. Never touch or chase marine life", "D. Touch quickly and move away"],
            correct_answer: "C. Never touch or chase marine life",
            explanation: "Touching or chasing animals causes stress, can remove protective coatings, and may trigger defensive behavior.",
            xp_reward: 25
        },
        {
            title: "Collecting Souvenirs",
            scenario: "You find a large, beautiful empty shell on a popular reef.",
            options: ["A. Take it as a souvenir", "B. Only take small shells", "C. Leave it in place", "D. Break it to share with friends"],
            correct_answer: "C. Leave it in place",
            explanation: "Even 'empty' shells provide habitat and calcium for the reef ecosystem; removing them can harm the environment.",
            xp_reward: 25
        }
    ],
    physics: [
        {
            title: "Balloon Experiment",
            scenario: "You take a balloon inflated with 2 liters of air from the surface down to 10 meters (33ft). What is its new volume?",
            options: ["A. 4 Liters", "B. 2 Liters", "C. 1 Liter", "D. 0.5 Liters"],
            correct_answer: "C. 1 Liter",
            explanation: "At 10m, the pressure is 2 ATA. According to Boyle's Law (P1V1 = P2V2), doubling the pressure halves the volume.",
            xp_reward: 40
        },
        {
            title: "Color Loss",
            scenario: "You are at 20 meters and cut your finger. The blood looks green/black. Why?",
            options: ["A. You are an alien", "B. Nitrogen Narcosis", "C. Water absorbs red light first", "D. The water is dirty"],
            correct_answer: "C. Water absorbs red light first",
            explanation: "Red light has the longest wavelength and is absorbed by water very quickly. By 5–10m, most red is gone, leaving things looking blue/green.",
            xp_reward: 25
        },
        {
            title: "Sound Underwater",
            scenario: "You hear a boat engine but cannot tell which direction it is coming from. Why?",
            options: ["A. Your hood blocks sound", "B. Sound travels 4x faster underwater", "C. Water muffles sound", "D. Sound travels slower underwater"],
            correct_answer: "B. Sound travels 4x faster underwater",
            explanation: "Sound travels ~4.3x faster in water. This speed makes it nearly impossible for human ears to detect the time delay needed to determine direction.",
            xp_reward: 30
        },
        {
            title: "Air Consumption at Depth",
            scenario: "You use 20 bar of air at the surface in 10 minutes. Roughly how much bar would you use in 10 minutes at 20 meters (3 ATA), all else equal?",
            options: ["A. 20 bar", "B. 30 bar", "C. 40 bar", "D. 60 bar"],
            correct_answer: "D. 60 bar",
            explanation: "At 20m the pressure is ~3 ATA, so you breathe about three times as much gas as at the surface.",
            xp_reward: 35
        },
        {
            title: "Mask Squeeze",
            scenario: "You descend quickly without adding air to your mask and feel pain and pressure on your face.",
            options: ["A. Sinus squeeze", "B. Ear barotrauma", "C. Mask squeeze", "D. Lung overexpansion"],
            correct_answer: "C. Mask squeeze",
            explanation: "As pressure increases, the airspace in the mask shrinks unless you exhale gently through your nose to equalize it.",
            xp_reward: 25
        },
        {
            title: "Lung Overexpansion Risk",
            scenario: "You are at 5 meters and consider holding your breath while ascending to the surface.",
            options: ["A. It's safe at shallow depth", "B. It's only risky deeper than 30m", "C. It's extremely dangerous and can cause lung overexpansion injury", "D. It's fine if you exhale at the top"],
            correct_answer: "C. It's extremely dangerous and can cause lung overexpansion injury",
            explanation: "Even a small depth change with a closed airway can cause serious barotrauma. Never hold your breath while scuba diving.",
            xp_reward: 40
        },
        {
            title: "Suit Compression",
            scenario: "As you descend in a wetsuit, you notice you need more weight or air in your BCD to stay neutral. Why?",
            options: ["A. The tank gets heavier", "B. The wetsuit neoprene compresses, losing buoyancy", "C. Your body becomes denser", "D. The regulator is working harder"],
            correct_answer: "B. The wetsuit neoprene compresses, losing buoyancy",
            explanation: "Increased pressure compresses the bubbles in neoprene, reducing its buoyancy and requiring more BCD inflation.",
            xp_reward: 30
        },
        {
            title: "Refraction Underwater",
            scenario: "Everything appears closer and larger underwater when using a mask. Why?",
            options: ["A. Water magnifies objects", "B. The mask glass bends light (refraction)", "C. Your eyes change shape", "D. Nitrogen narcosis"],
            correct_answer: "B. The mask glass bends light (refraction)",
            explanation: "Light slows and bends when passing from water to air in the mask, making objects appear about 25–30% larger and closer.",
            xp_reward: 25
        }
    ],
    hand_signals: [
        {
            title: "The OK Sign",
            scenario: "Your buddy makes a circle with their thumb and index finger. What does this mean?",
            options: ["A. Look at this hole", "B. Are you OK? / I am OK", "C. Going up", "D. Zero air left"],
            correct_answer: "B. Are you OK? / I am OK",
            explanation: "This is the universal sign for 'Everything is alright'.",
            xp_reward: 10
        },
        {
            title: "Thumb Up",
            scenario: "Your divemaster gives a 'Thumbs Up' signal. What should you do?",
            options: ["A. Be happy", "B. Ascend / End the dive", "C. Look up", "D. Increase buoyancy"],
            correct_answer: "B. Ascend / End the dive",
            explanation: "In diving, a thumbs up specifically means 'Go up' or 'End the dive', not 'Good job'.",
            xp_reward: 15
        },
        {
            title: "Low Air",
            scenario: "A diver places a closed fist against their chest. What are they saying?",
            options: ["A. My chest hurts", "B. I am low on air", "C. I am cold", "D. Beat your chest"],
            correct_answer: "B. I am low on air",
            explanation: "A fist to the chest indicates 'Low on air'. A slashing motion across the throat would mean 'Out of air'.",
            xp_reward: 20
        },
        {
            title: "Out of Air Signal",
            scenario: "A diver draws a flat hand quickly across their throat.",
            options: ["A. I am choking", "B. Out of air", "C. I am cold", "D. I am sick"],
            correct_answer: "B. Out of air",
            explanation: "The throat-slash gesture is the standard signal for 'Out of air' and requires immediate assistance.",
            xp_reward: 25
        },
        {
            title: "Level Off Signal",
            scenario: "Your buddy holds a flat hand, palm down, and moves it side to side like 'rocking' the air.",
            options: ["A. Stay at this depth / level off", "B. Go to the surface", "C. Go down", "D. Move sideways"],
            correct_answer: "A. Stay at this depth / level off",
            explanation: "A flat, rocking hand indicates 'Hold this depth' or 'Stay here'.",
            xp_reward: 15
        },
        {
            title: "Something is Wrong",
            scenario: "Your buddy holds a flat hand, palm down, and rocks it side to side in front of them.",
            options: ["A. I'm ok", "B. I’m a little cold", "C. Something is wrong / so-so", "D. Let's go up"],
            correct_answer: "C. Something is wrong / so-so",
            explanation: "The 'so-so' rocking hand means something is not right. You should stop and communicate.",
            xp_reward: 20
        },
        {
            title: "Go Down",
            scenario: "Your guide points their thumb downwards.",
            options: ["A. Bad dive", "B. Descend / go down", "C. Look down", "D. Out of air"],
            correct_answer: "B. Descend / go down",
            explanation: "Thumb down is used to signal 'Descend', opposite to the thumbs up for 'Ascend'.",
            xp_reward: 15
        },
        {
            title: "Buddy Signal",
            scenario: "Your instructor points at their eyes with two fingers, then points at you, then another diver.",
            options: ["A. Watch me", "B. You and that diver are buddies", "C. Look over there", "D. I am watching you"],
            correct_answer: "B. You and that diver are buddies",
            explanation: "Pointing between two divers indicates 'You two are buddies' or 'Stay together'.",
            xp_reward: 20
        }
    ]
};