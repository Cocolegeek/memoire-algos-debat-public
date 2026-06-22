// Écran de chargement plein écran : masque le flash de contenu vide ou
// partiel pendant le fetch de results.json. Anneaux concentriques en onde
// (motif ping/sonar), couleur "ink" via currentColor pour suivre le thème
// clair/sombre automatiquement, sans logique JS séparée.
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const ANNEAUX = [0, 0.45, 0.9]

export default function LoadingScreen({ visible }) {
  const reduitMouvement = useReducedMotion()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg"
          role="status"
          aria-live="polite"
        >
          <span className="sr-only">Chargement des données…</span>
          <div className="relative flex h-20 w-20 items-center justify-center text-ink sm:h-24 sm:w-24">
            {reduitMouvement ? (
              <span className="h-3 w-3 rounded-full bg-current" aria-hidden="true" />
            ) : (
              <>
                {ANNEAUX.map((delai) => (
                  <motion.span
                    key={delai}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full border-2 border-current"
                    initial={{ scale: 0.2, opacity: 0.6 }}
                    animate={{ scale: 1.4, opacity: 0 }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: delai }}
                  />
                ))}
                <span className="h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true" />
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
