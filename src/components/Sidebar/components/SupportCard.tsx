// import { FaHeadset } from "react-icons/fa";

// interface SupportCardProps {
//   collapsed: boolean;
// }

// export default function SupportCard({ collapsed }: SupportCardProps) {
//   const handleCallHelpdesk = () => {
//     window.open("tel:+18005550199");
//   };

//   return (
//     <div className="sidebar-bottom">
//       {!collapsed ? (
//         <>
//           <div className="support-card-premium">
//             <div className="support-card-glow"></div>
//             <div className="support-icon-wrapper">
//               <FaHeadset />
//             </div>
//             <h4>Need Support?</h4>
//             <p>Veterinary helpdesk & tech support is active.</p>
//             <button onClick={handleCallHelpdesk}>Call Helpdesk</button>
//           </div>

//           <div className="version-info">
//             <span className="pulse-dot"></span>
//             GowMithra Enterprise v1.2.0
//           </div>
//         </>
//       ) : (
//         <div className="support-collapsed-btn">
//           <button aria-label="Support Contact" onClick={handleCallHelpdesk}>
//             <FaHeadset />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
