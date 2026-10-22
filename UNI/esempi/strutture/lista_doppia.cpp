// Lista doppiamente concatenata, circolare, con nodo sentinella.
// La sentinella non contiene dati: sent->next è il primo nodo, sent->prev
// l'ultimo. Così inserire e togliere non hanno mai casi speciali.
#include <iostream>
using namespace std;

//@region doppia
struct NodoD {
    int val;
    NodoD* prev;   // nodo precedente
    NodoD* next;   // nodo successivo
};

NodoD* creaLista() {                        // lista vuota: la sentinella punta a sé
    NodoD* sent = new NodoD{0, nullptr, nullptr};
    sent->prev = sent;
    sent->next = sent;
    return sent;
}

void inserisciDopo(NodoD* p, int x) {       // Θ(1), anche se p è la sentinella
    NodoD* nuovo = new NodoD{x, p, p->next};
    p->next->prev = nuovo;
    p->next = nuovo;
}

void rimuovi(NodoD* p) {                    // Θ(1): il precedente è p->prev
    p->prev->next = p->next;
    p->next->prev = p->prev;
    delete p;
}
//@endregion

void stampa(NodoD* sent) {
    cout << "avanti:   ";
    for (NodoD* p = sent->next; p != sent; p = p->next) cout << p->val << ' ';
    cout << "\nindietro: ";
    for (NodoD* p = sent->prev; p != sent; p = p->prev) cout << p->val << ' ';
    cout << '\n';
}

int main() {
    NodoD* sent = creaLista();
    inserisciDopo(sent->prev, 15);          // in coda: dopo l'ultimo
    inserisciDopo(sent->prev, 23);
    inserisciDopo(sent, 8);                 // in testa: dopo la sentinella
    stampa(sent);

    rimuovi(sent->next->next);              // toglie il 15, senza cercare il precedente
    stampa(sent);

    while (sent->next != sent)              // svuota la lista
        rimuovi(sent->next);
    delete sent;
    return 0;
}
