/**
 * Singleton per tracciare chiamate a createRoute() e identificare link rotti
 */
class RouteTracker {
	private calledIds = new Set<string>()
	private validPageIds = new Set<string>()

	/**
	 * Registra un $id chiamato da createRoute()
	 */
	recordCall($id: string): void {
		this.calledIds.add($id)
	}

	/**
	 * Imposta la lista degli $id delle pagine esistenti
	 */
	setValidPageIds(ids: string[]): void {
		this.validPageIds = new Set(ids)
	}

	/**
	 * Ritorna gli $id chiamati che non hanno una pagina corrispondente
	 */
	getBrokenLinkIds(): string[] {
		return Array.from(this.calledIds).filter((id) => !this.validPageIds.has(id))
	}

	/**
	 * Ottieni tutti gli $id chiamati
	 */
	getCalledIds(): string[] {
		return Array.from(this.calledIds)
	}

	/**
	 * Resetta il tracking
	 */
	reset(): void {
		this.calledIds.clear()
	}
}

// Export singleton instance
export const routeTracker = new RouteTracker()
