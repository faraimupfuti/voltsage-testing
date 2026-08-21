'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Reveal from './Reveal'

const ARTICLES = [
  {
    title: 'Why Do Solar Quotes Vary So Much for the Same House?',
    tag: 'Buying smart',
    body: `"I got three quotations for my house, and every installer recommended a different system. Which one is right?"

If you've ever requested multiple solar quotations, you've probably experienced this. One company recommends a 5 kW inverter, another suggests 8 kW, and a third insists you need 10 kW. Battery sizes differ, the number of solar panels varies, and before long you're left wondering whether anyone really knows what your house needs.

The truth is, there isn't always one "correct" answer. But there should always be a good reason behind the recommendation.

The first reason quotations can differ is straightforward: not every supplier works with the same equipment. One installer may recommend one inverter brand because of its performance or warranty, while another may use a different manufacturer because that's what they stock or are familiar with. Different brands also have different features, efficiencies, and pricing, all of which influence the final quotation.

The more important reason, however, lies in how the system is sized.

A solar system shouldn't be designed simply because a house has three bedrooms or because last month's electricity bill was a certain amount. It should be designed around the way electricity is actually used.

Think about two houses on the same street. They might look almost identical from the outside, yet their energy needs could be completely different. One family may be home throughout the day, while the other leaves for work every morning and returns in the evening. One home may have a borehole pump, two refrigerators, and an electric gate, while another has none of these.

On paper, both houses might consume a similar amount of electricity each month. In reality, they may require very different solar systems.

This is why a proper load assessment is so important. A good design isn't based only on how much electricity you use. It's also based on when you use it, which appliances operate together, and whether those appliances have motors or compressors that create starting surges.

That's the thinking behind VoltSage. We believe that good energy decisions start with good information. Our sizing tools are designed to help you understand your unique energy requirements before comparing equipment or requesting quotations.

The best solar system isn't necessarily the biggest, the cheapest, or the one with the most panels. It's the one that's been engineered around the way you use energy.`,
  },
  {
    title: 'Why Does the VoltSage Sizing Tool Consider Surge Demand?',
    tag: 'Solar basics',
    body: `Did You Know?

A refrigerator that consumes only 150 W while running can briefly require 450–900 W when its compressor starts. This momentary increase in power, known as surge demand, is one of the most common reasons why undersized inverters trip, overload, or shut down.

The same principle applies to other appliances that contain motors or compressors, including refrigerators and freezers, borehole and pressure pumps, compressors and power tools.

This is why inverter sizing is not just about matching the running load. To ensure reliability, the inverter must also be able to handle short surge events without tripping when motors or compressors start. There are two quick ways an inverter can be sized:

Method 1 – Select an Inverter Based on Continuous Power

A common approach is to select an inverter with a continuous power rating equal to or greater than the calculated peak running demand.

Example:
— Peak running demand: 3.0 kW
— Maximum surge demand: 4.5 kW

Using this method alone, a 3 kW inverter would appear to be sufficient. However, if its surge capability is less than 4.5 kW, it may trip each time a motor starts.

Method 2 – Consider the Inverter's Surge Capability (Highly Recommended)

A more economical approach is to select the smallest inverter whose continuous power rating meets the running demand and whose surge withstand rating exceeds the calculated surge demand.

Example:
— Peak running demand: 3.0 kW
— Maximum surge demand: 4.5 kW

Instead of purchasing a much larger inverter simply to accommodate motor starting, you could choose an inverter with a continuous output rating of 5 kW and a surge capability of 10 kW for 10 seconds. This inverter comfortably supplies the 3 kW running load while also accommodating the 4.5 kW motor starting demand.

At VoltSage, we don't simply recommend a larger inverter because an appliance has a high starting current. Instead, we evaluate both the continuous running demand and the temporary surge demand to recommend an inverter that is technically suitable and economically optimised.`,
  },
  {
    title: 'kW vs kVA — What\'s the Difference?',
    tag: 'Solar basics',
    body: `If you've been comparing solar inverters, you've probably noticed that some are advertised as 5 kW, 8 kW, or 12 kW, while others are rated as 5 kVA, 10 kVA, or even 15 kVA. So, what do these ratings mean, and does it matter?

The short answer is yes — understanding the difference can help you select the right inverter and compare products more accurately.

kW (kilowatts) is the real power consumed by your appliances to perform useful work. This is the power that produces heat, light, cooling, pumping, or motion.

kVA (kilovolt-amperes) is the apparent power, which represents the total electrical power supplied by the inverter. Apparent power includes both the useful power (kW) and the reactive power required by certain electrical equipment, particularly motors and inductive loads.

The relationship between the two is:
kW = kVA × Power Factor (PF)

The Power Factor (PF) indicates how efficiently electrical power is converted into useful work. For purely resistive loads, such as kettles and electric heaters, the power factor is close to 1.0. Motor-driven equipment, such as pumps and air conditioners, typically has a lower power factor.

Example: Consider an inverter rated at 5 kVA with a power factor of 0.8. Its maximum continuous real power output is:
5 kVA × 0.8 = 4 kW

Although the inverter is labelled 5 kVA, it can continuously supply only 4 kW of useful power.

The VoltSage Tip: When comparing two inverters, don't rely solely on the number displayed on the front panel. Check the manufacturer's datasheet to confirm the continuous output rating (kW or kVA), the rated power factor (if specified in kVA), the maximum surge or overload capability, and the duration for which the surge power can be sustained.`,
  },
  {
    title: 'Understanding Battery Technologies',
    tag: 'Batteries',
    body: `"Which battery is the best?"

It's one of the first questions people ask when they're considering a solar system. Unfortunately, it's also one of the hardest questions to answer because there isn't a single battery that's best for everyone.

The better question is: "Which battery is best for the way I use energy?"

Lead-acid batteries have been around for decades and remain one of the most affordable ways to store electrical energy. They have a lower upfront cost, making them attractive where budget is the main concern. However, they are larger, heavier, require more maintenance in some cases, and generally have a shorter service life than modern lithium batteries. They also perform best when they are not discharged too deeply on a regular basis.

Lithium Iron Phosphate (LiFePO₄) batteries have become the preferred choice for most new solar installations. Although they cost more initially, they typically last much longer, can be discharged much deeper without significantly affecting their lifespan, require little maintenance, and are generally more efficient.

So Why Are Lithium Batteries More Expensive?

Comparing batteries based only on purchase price is like comparing two vehicles based only on the cost of the fuel tank. A battery's real value comes from how much usable energy it can deliver over its lifetime.

For example, two batteries may both be labelled as 10 kWh, but if one can regularly use 90% of its stored energy while the other should only use about 50%, they provide very different amounts of usable energy in everyday operation.

At VoltSage, we believe that battery selection should be driven by engineering, not marketing. When your battery is selected based on your unique energy requirements, you're far more likely to end up with a system that performs well, represents good value for money, and continues to meet your needs for years to come.`,
  },
  {
    title: 'Battery Capacity Explained: What Does 5 kWh or 10 kWh Actually Mean?',
    tag: 'Batteries',
    body: `"I'm looking at two batteries. One is 5 kWh and the other is 10 kWh. Does that mean the 10 kWh battery will power my house for 10 hours?"

Not quite.

One of the most common misconceptions about solar batteries is that the number printed on the battery tells you how long it will last. In reality, battery capacity tells you how much energy the battery can store — not how long it can power your home.

To understand why, imagine a battery as a water tank. The larger the tank, the more water it can hold. But how long that water lasts depends on how many taps are open and how much water is flowing through them.

Suppose your essential household appliances consume a total of 500 W (0.5 kW). This could include a refrigerator, a few LED lights, a Wi-Fi router, a television, and phone charging.

A 5 kWh battery could theoretically supply those loads for:
5 kWh ÷ 0.5 kW = 10 hours

Now suppose you switch on additional appliances and your total demand increases to 2 kW. The same battery would now last approximately:
5 kWh ÷ 2 kW = 2.5 hours

The battery hasn't changed — only the amount of power being drawn from it.

Depth of Discharge (DoD)

Most batteries are designed to operate within a recommended Depth of Discharge. A 10 kWh battery with a recommended DoD of 90% provides approximately 9 kWh of usable energy — not 10 kWh.

Efficiency Also Matters

Modern lithium batteries are typically around 95% efficient. If a battery stores 9 kWh of usable energy at 95% efficiency, the energy effectively available to your appliances is approximately 8.55 kWh.

At VoltSage, our Battery Runtime Tool considers all of these factors so you know exactly what backup time to expect before you buy.`,
  },
  {
    title: 'Solar Backup vs Generator Backup: Which One Is Right for You?',
    tag: 'Economics',
    body: `"The power is out again. Should I buy a generator, install solar, or consider both?"

This is a question many homeowners, business owners, farmers, and institutions are asking as electricity reliability becomes a bigger concern. The truth is, there is no single solution that is perfect for everyone.

Understanding Solar Backup Systems

When people say they want "solar backup," they are usually referring to a system consisting of solar panels (which generate electricity from sunlight), batteries (which store energy for later use), and an inverter (which converts stored energy into usable electricity for appliances).

Off-Grid Solar Systems are designed for locations where there is no reliable electricity grid connection. The system relies entirely on solar generation and battery storage to supply energy.

Hybrid Solar Systems have become one of the most popular choices for homes and businesses connected to the grid. Unlike off-grid systems, hybrid inverters can intelligently manage solar power, battery storage, grid electricity, and generator input.

The Advantages of Solar Backup

A generator typically sits idle until there is an outage. Solar panels, however, can produce electricity every day and reduce dependence on the grid. The benefits include lower electricity costs over time, no fuel requirement during normal operation, quiet operation, and reduced emissions.

Where Generators Still Have an Advantage

As long as fuel is available, a generator can continue supplying power regardless of weather conditions, time of day, or battery capacity. This makes generators particularly useful for large facilities with high energy demand and long-duration outages.

The Hybrid Approach: Solar + Battery + Generator

For many applications, the best solution is combining them. A hybrid energy system can use solar as the primary energy source, batteries for short-term backup, and a generator for extended outages or high-demand periods.

The right backup solution depends on what appliances must remain powered during an outage, how long outages typically last, and whether the goal is backup power, energy savings, or energy independence. Energy decisions should always start with understanding your requirements — not selecting equipment first.`,
  },
]

export default function ArticlesSection() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section id="articles" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <div className="section-eyebrow">VoltSage Learn</div>
          <h2 className="font-disp font-extrabold text-4xl sm:text-5xl text-ink uppercase leading-tight mb-4">
            Read before you<br /><span className="brand-text">talk to any installer</span>
          </h2>
          <p className="text-ink-muted text-base">
            Six plain-language articles covering the questions we get asked most — written to help you ask better questions, not to sell you anything.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {ARTICLES.map((a, i) => (
            <Reveal key={i} delay={i*60} className={`rounded-2xl border overflow-hidden transition-all duration-300 ${open===i?'border-brand-teal shadow-teal':'border-surface-border hover:border-surface-border2 shadow-card'} bg-white`}>
              <button onClick={() => setOpen(open===i?null:i)} className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="badge badge-teal flex-shrink-0">{a.tag}</span>
                  <h3 className="font-disp font-bold text-lg text-ink uppercase group-hover:text-brand-teal transition-colors leading-tight">{a.title}</h3>
                </div>
                <ChevronDown size={18} className={`flex-shrink-0 text-ink-faint transition-transform duration-300 ${open===i?'rotate-180':''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open===i?'max-h-[2000px] opacity-100':'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6">
                  <div className="h-px bg-surface-border mb-5" />
                  {a.body.split('\n\n').map((para, j) => (
                    <p key={j} className="text-ink-muted text-sm leading-relaxed mb-4 last:mb-0 whitespace-pre-line">{para}</p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
