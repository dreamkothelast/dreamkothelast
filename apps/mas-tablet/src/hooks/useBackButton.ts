import { useEffect, useRef } from "react";

/**
 * Gère le bouton « retour » matériel d'Android (et le geste de retour).
 *
 * Technique web-standard : on sème une entrée d'historique et on intercepte
 * l'événement `popstate`. Sur la version Windows (bureau), aucun bouton retour
 * n'existe : `popstate` ne se déclenche pas, ce hook est donc sans effet.
 *
 * Choix volontaire pour une MAS : le bouton retour ramène toujours à l'accueil
 * et ne ferme JAMAIS l'application par mégarde (comportement « kiosque »).
 * La sortie de l'app se fait délibérément via le système (apps récentes).
 *
 * @param onBack  appelé à chaque pression « retour ». Doit effectuer la
 *                navigation interne (fermer un panneau, revenir à l'accueil…).
 */
export function useBackButton(onBack: () => void) {
  const handlerRef = useRef(onBack);
  handlerRef.current = onBack;

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Sème une entrée d'historique « tampon » à absorber au premier retour.
    window.history.pushState(null, "");

    const onPop = () => {
      handlerRef.current();
      // Re-sème immédiatement : on garde toujours une entrée à intercepter,
      // l'app ne se ferme donc jamais via le bouton retour.
      window.history.pushState(null, "");
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
}
