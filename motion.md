\## MOTION, ANIMATION \& SMOOTH SCROLLING ARCHITECTURE



The application must have a premium, intentional motion system suitable for a modern 2026 AI-era e-commerce product.



Do NOT treat animation as decoration. Motion must improve:



\* Visual hierarchy

\* Product storytelling

\* User feedback

\* Navigation continuity

\* Content discovery

\* Perceived quality

\* Brand identity

\* Interaction clarity



The motion system must feel premium, restrained, smooth and purposeful — never flashy, childish, excessive or generic.



\---



\### 1. PRIMARY MOTION TECHNOLOGY STACK



Use the following motion architecture:



\* \*\*GSAP\*\* — primary advanced animation engine

\* \*\*GSAP ScrollTrigger\*\* — scroll-driven and viewport-driven animations

\* \*\*Lenis\*\* — smooth scrolling

\* \*\*CSS transitions\*\* — simple hover, focus and micro-interactions

\* \*\*React state / Framer-style state logic only when appropriate for UI state\*\*, not as a replacement for GSAP



The primary motion architecture is:



\*\*Lenis → Smooth Scrolling → GSAP / ScrollTrigger → Scroll-driven Motion → Premium UI Experience\*\*



Do not introduce another animation library unless there is a genuine architectural requirement.



\---



\### 2. LENIS SMOOTH SCROLLING



Integrate \*\*Lenis\*\* as the application's smooth scrolling layer.



Requirements:



\* Smooth scrolling must feel natural and premium.

\* Integrate Lenis correctly with GSAP and ScrollTrigger.

\* Ensure ScrollTrigger remains synchronized with Lenis.

\* Do not create scroll-jacking behavior.

\* Preserve normal browser scrolling semantics.

\* Ensure mouse-wheel, trackpad and touch interactions remain usable.

\* Test scrolling behavior on desktop, tablet and mobile.

\* Ensure modals, drawers, dropdowns and overlays can lock/unlock scrolling correctly.

\* Do not allow background scrolling when a modal, drawer or fullscreen overlay requires scroll locking.

\* Keyboard scrolling must continue to work.

\* Accessibility must not be negatively affected.

\* Respect `prefers-reduced-motion`.



Lenis must enhance scrolling rather than interfere with usability.



\---



\### 3. GSAP



Use GSAP for advanced animation sequences where CSS transitions are insufficient.



Potential use cases include:



\* Hero entrance animations

\* Product storytelling

\* Image reveal sequences

\* Product image transitions

\* Promotional sections

\* Category storytelling

\* Scroll-based product showcases

\* Sticky/pinned storytelling sections

\* Progressive section reveals

\* Navigation transitions

\* Mega-menu transitions

\* Cart drawer transitions

\* Product gallery transitions

\* CTA emphasis

\* Featured product interactions

\* AI recommendation sections

\* Editorial commerce sections

\* Visual transitions between major content blocks



GSAP animations should be modular and reusable.



Do not place large animation timelines directly inside page components when they can be extracted into reusable animation utilities/hooks.



\---



\### 4. GSAP SCROLLTRIGGER



Use \*\*ScrollTrigger\*\* for meaningful scroll-based experiences.



Examples:



\* Fade/slide section entrances

\* Image reveal on scroll

\* Product storytelling

\* Product image transformations

\* Progressive content reveals

\* Pinned product storytelling

\* Horizontal scrolling sections where genuinely useful

\* Parallax effects where they improve the experience

\* Sequential product/category presentation

\* Promotional campaign storytelling



ScrollTrigger must NOT be used simply because it is available.



Every scroll animation must have a UX purpose.



Avoid:



\* Excessive parallax

\* Constant movement

\* Large unnecessary vertical shifts

\* Animation on every single card

\* Endless stagger animations

\* Overly slow transitions

\* Scroll effects that make browsing tiring

\* Animations that delay access to content

\* Animations that interfere with product comparison or purchasing



\---



\### 5. ANIMATION HIERARCHY



Use a clear animation hierarchy.



\#### Level 1 — Micro Interaction



Prefer CSS transitions for:



\* Button hover

\* Button press

\* Link hover

\* Icon hover

\* Input focus

\* Card hover

\* Image hover

\* Wishlist interaction

\* Quantity controls

\* Toggle states



These should remain fast and subtle.



\#### Level 2 — Component Animation



Use GSAP or carefully structured CSS when required for:



\* Product gallery transitions

\* Cart drawer

\* Search panel

\* Mega menu

\* Filter panel

\* Quick-view modal

\* Product variant transitions

\* Recommendation carousel transitions

\* Notification/toast entrance



\#### Level 3 — Page / Section Animation



Use GSAP + ScrollTrigger for:



\* Hero storytelling

\* Major section reveals

\* Product showcases

\* Editorial commerce sections

\* Promotional campaigns

\* Category storytelling

\* Featured product presentations



\#### Level 4 — Signature Brand Motion



For important visual moments, create distinctive motion that reinforces the application's unique brand identity.



Examples:



\* Signature hero entrance

\* Product reveal

\* Brand transition

\* AI-powered recommendation reveal

\* Premium promotional storytelling

\* Special campaign sections



Signature motion should be used selectively.



\---



\### 6. PAGE LOAD EXPERIENCE



Do not create a long cinematic loading animation before the user can interact with the application.



Initial page loading should prioritize:



1\. Content availability

2\. Perceived performance

3\. Navigation readiness

4\. Product discovery

5\. Then visual enhancement



Use lightweight entrance animations only where they improve hierarchy.



The user should never feel that the application is deliberately making them wait for an animation.



\---



\### 7. PRODUCT CARD MOTION



Product cards should feel responsive and premium.



Potential interactions:



\* Image transition

\* Subtle image zoom

\* Hover elevation

\* Quick-action reveal

\* Wishlist feedback

\* Add-to-cart feedback

\* Variant selection feedback

\* Price/availability state transition



Avoid making every product card perform the same large animation.



Motion intensity should remain controlled.



\---



\### 8. PRODUCT DETAIL PAGE MOTION



The PDP should be one of the strongest motion experiences in the application.



Potential interactions:



\* Gallery transitions

\* Thumbnail selection

\* Image zoom

\* Variant changes

\* Product information reveal

\* Sticky purchase area transitions

\* Add-to-cart feedback

\* Wishlist feedback

\* Recommendation reveal

\* Related-product transitions

\* Scroll-driven storytelling where appropriate



The product itself must remain the visual focus.



Animation must never compete with product information, price, availability or purchase actions.



\---



\### 9. HERO SECTION MOTION



The hero section may use GSAP and ScrollTrigger for a premium first impression.



Possible elements:



\* Headline reveal

\* Supporting text reveal

\* CTA entrance

\* Product/visual reveal

\* Image movement

\* Layered depth

\* Subtle scroll response

\* Background transition

\* Product storytelling



Do not use generic:



\* Text bouncing

\* Excessive zoom

\* Random rotations

\* Large parallax

\* Overlapping animations everywhere



The hero animation must be specific to the product's brand identity.



\---



\### 10. NAVIGATION \& HEADER MOTION



Navigation should feel highly polished.



Consider:



\* Header state transition on scroll

\* Sticky header transformation

\* Search expansion

\* Mega-menu entrance

\* Category menu transitions

\* Mobile drawer transitions

\* Account/cart interaction feedback



Header motion should remain fast and functional.



Never sacrifice navigation speed for visual effects.



\---



\### 11. CART \& CHECKOUT MOTION



Cart interactions should provide clear feedback.



Examples:



\* Add-to-cart confirmation

\* Cart count update

\* Cart drawer entrance

\* Product item insertion

\* Quantity update

\* Item removal

\* Coupon application feedback

\* Checkout step transition

\* Payment state transition



Motion should communicate state changes clearly.



It must never hide or delay important commerce information.



\---



\### 12. AI EXPERIENCE MOTION



AI features must not look like generic chatbot widgets.



If AI functionality is present, use motion to create a native product experience.



Examples:



\* AI recommendation reveal

\* AI search suggestions

\* Conversational shopping interface

\* Personalized product discovery

\* Smart filters

\* AI-generated insights

\* Product comparison assistance

\* AI review summaries



Avoid generic:



> "AI assistant bubble"



with meaningless animated effects.



AI should feel embedded into the commerce workflow.



Motion should reinforce that experience.



\---



\### 13. RESPONSIVE MOTION



Motion must be responsive.



Desktop, tablet and mobile must not blindly use identical animation behavior.



For mobile:



\* Reduce animation complexity where appropriate.

\* Avoid expensive parallax.

\* Avoid excessive pinned sections.

\* Avoid long animation sequences.

\* Prioritize touch interaction.

\* Preserve scrolling performance.

\* Ensure gestures do not conflict with scrolling.

\* Ensure drawers and sheets behave naturally.



\---



\### 14. PERFORMANCE RULES



Animation performance is a first-class requirement.



Prefer animating:



\* `transform`

\* `opacity`



Avoid unnecessary animation of layout-triggering properties such as:



\* width

\* height

\* top

\* left

\* margin

\* padding



unless there is a specific reason.



Avoid unnecessary:



\* layout recalculation

\* DOM measurement loops

\* large animation timelines

\* excessive simultaneous animations

\* high-frequency React state updates during scroll



Scroll-driven animations must remain smooth.



Do not sacrifice Core Web Vitals for visual effects.



\---



\### 15. COMPONENT-LEVEL ANIMATION ARCHITECTURE



Animations must be maintainable.



Prefer reusable utilities/hooks/modules such as:



\* smooth-scroll initialization

\* GSAP context management

\* ScrollTrigger setup

\* reveal animation utilities

\* page transition utilities

\* product animation utilities

\* modal/drawer animation utilities



Ensure animations are properly cleaned up when React components unmount.



Avoid memory leaks and duplicated GSAP timelines.



Do not initialize the same Lenis or ScrollTrigger system multiple times unnecessarily.



\---



\### 16. NEXT.JS COMPATIBILITY



Because the current implementation uses Next.js:



\* Handle browser-only animation APIs correctly.

\* Do not execute GSAP/Lenis browser logic during server rendering.

\* Use client components only where required.

\* Keep the majority of components server-renderable where practical.

\* Avoid converting the entire application into Client Components just for animation.

\* Dynamically initialize browser-dependent animation systems when appropriate.

\* Ensure animations do not break SSR or hydration.



Animation architecture must remain compatible with a production Next.js application.



\---



\### 17. ACCESSIBILITY



Respect:



`prefers-reduced-motion`



When reduced motion is enabled:



\* Disable unnecessary decorative animation.

\* Reduce scroll-driven effects.

\* Reduce parallax.

\* Reduce long transitions.

\* Preserve functional feedback.

\* Maintain normal navigation and usability.



Accessibility takes priority over decorative motion.



\---



\### 18. MOTION TOKENS



Motion should be treated as part of the design system.



Define reusable motion values for:



\* Duration

\* Delay

\* Easing

\* Stagger

\* Distance

\* Scale

\* Opacity

\* Transition intensity



Do not scatter random animation values throughout the codebase.



Where appropriate, motion values should align with the existing design-token architecture.



\---



\### 19. MOTION SHOULD SUPPORT BRAND IDENTITY



Do not copy animation patterns from generic:



\* SaaS websites

\* AI dashboards

\* Template marketplaces

\* Random e-commerce templates

\* Dribbble-style concept designs



The animation language must emerge from the application's own:



\* Brand

\* Product category

\* Design tokens

\* Typography

\* Visual identity

\* Product photography

\* Content strategy

\* Interaction model



The result should feel like a real branded product, not a collection of animation effects.



\---



\### 20. FINAL MOTION QUALITY BAR



Before considering the motion system complete, verify:



\* Is scrolling smooth?

\* Is Lenis correctly integrated?

\* Is GSAP used where it adds real value?

\* Is ScrollTrigger used purposefully?

\* Are animations subtle and premium?

\* Does the application remain fast?

\* Does mobile scrolling remain natural?

\* Does reduced-motion work?

\* Are drawers/modals correctly locking scroll?

\* Are animations cleaned up correctly?

\* Are there unnecessary animations?

\* Does motion reinforce the product's brand?

\* Does the user remain in control?

\* Does animation improve commerce conversion without becoming distracting?

\* Does the application still feel premium when animations are reduced or disabled?



\### PRIMARY RULE



\*\*GSAP + ScrollTrigger + Lenis should form the primary advanced motion and smooth-scrolling architecture of the application.\*\*



Use motion intentionally, not excessively.



The goal is not "more animation".



The goal is:



\*\*better interaction + stronger product storytelling + premium brand perception + smooth UX + production-grade performance.\*\*



