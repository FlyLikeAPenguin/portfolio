import { Suspense, useEffect } from 'react'
import { concepts } from './concepts/registry'
import { useRoute } from './shared/router'
import ConceptSwitcher from './shared/ConceptSwitcher'
import ConceptsIndex from './ConceptsIndex'

export default function App() {
  const route = useRoute()
  const concept = concepts.find((c) => c.id === route)

  useEffect(() => {
    document.title = concept ? `Joe Thornton · ${concept.title}` : 'Joe Thornton · Five directions'
  }, [concept])

  if (!concept) return <ConceptsIndex />

  const { Component } = concept
  return (
    <>
      <Suspense fallback={<div className="route-loading" />}>
        <Component key={concept.id} />
      </Suspense>
      <ConceptSwitcher current={concept.id} />
    </>
  )
}
