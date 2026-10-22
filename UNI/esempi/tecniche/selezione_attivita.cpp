// Selezione di attività: il massimo numero di attività compatibili (che non
// si sovrappongono) tra quelle che chiedono la stessa aula.
// Greedy: ordina per tempo di fine e prendi ogni attività che inizia quando
// l'ultima scelta è già finita. Costo: O(n log n), dovuto all'ordinamento.
#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

struct Attivita {
    char nome;
    int inizio, fine;   // occupa l'intervallo [inizio, fine)
};

//@region greedy
vector<Attivita> selezionaAttivita(vector<Attivita> a) {   // copia: si ordina quella
    sort(a.begin(), a.end(), [](const Attivita& x, const Attivita& y) {   //@sort
        return x.fine < y.fine;
    });
    vector<Attivita> scelte;
    int n = a.size();
    if (n == 0) return scelte;
    scelte.push_back(a[0]);                     //@first
    int k = 0;                                  // indice dell'ultima attività scelta
    for (int m = 1; m < n; m++) {               //@loop
        if (a[m].inizio >= a[k].fine) {         //@check
            scelte.push_back(a[m]);             //@take
            k = m;                              //@last
        }
    }
    return scelte;
}
//@endregion

int main() {
    // le 11 attività dell'esempio del Cormen, in ordine sparso
    vector<Attivita> a = {
        {'A', 5, 9},  {'B', 1, 4},  {'C', 8, 12}, {'D', 0, 6},
        {'E', 3, 5},  {'F', 12, 16}, {'G', 6, 10}, {'H', 5, 7},
        {'I', 2, 14}, {'J', 8, 11}, {'K', 3, 9}};
    vector<Attivita> s = selezionaAttivita(a);
    cout << "Attività scelte: " << s.size() << '\n';
    for (const Attivita& x : s)
        cout << x.nome << "  [" << x.inizio << ", " << x.fine << ")\n";
    return 0;
}
