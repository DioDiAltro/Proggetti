// Codici di Huffman: si fondono sempre i due alberi con la frequenza più
// bassa, finché ne resta uno solo. La coda con priorità (un min-heap) dà
// ogni volta il minimo in O(log n): in tutto O(n log n).
// Codice di un carattere: il cammino dalla radice alla sua foglia
// (0 = a sinistra, 1 = a destra).
#include <iostream>
#include <queue>
#include <string>
#include <utility>
#include <vector>
using namespace std;

struct Nodo {
    int freq;
    char c;      // il carattere (solo nelle foglie)
    int id;      // ordine di creazione: decide a parità di frequenza
    Nodo* sx;
    Nodo* dx;
};

// priority_queue tiene in cima l'elemento "più grande" secondo il confronto:
// dichiarando più grande chi ha frequenza minore, in cima c'è il minimo
struct PiuPiccolo {
    bool operator()(const Nodo* a, const Nodo* b) const {
        if (a->freq != b->freq) return a->freq > b->freq;
        return a->id > b->id;
    }
};

//@region huffman
Nodo* huffman(const vector<pair<char, int>>& freq) {
    priority_queue<Nodo*, vector<Nodo*>, PiuPiccolo> q;
    int id = 0;
    for (auto [c, f] : freq)                                    //@init
        q.push(new Nodo{f, c, id++, nullptr, nullptr});
    while (q.size() > 1) {                                      //@loop
        Nodo* x = q.top(); q.pop();                             //@pop1
        Nodo* y = q.top(); q.pop();                             //@pop2
        q.push(new Nodo{x->freq + y->freq, '\0', id++, x, y});  //@merge
    }
    return q.top();                                             //@root
}
//@endregion

// visita: scende a sinistra con 0 e a destra con 1
void codici(const Nodo* t, const string& prefisso, vector<pair<char, string>>& out) {
    if (t->sx == nullptr) {   // foglia (nell'albero di Huffman i nodi interni hanno sempre 2 figli)
        out.push_back({t->c, prefisso.empty() ? "0" : prefisso});
        return;
    }
    codici(t->sx, prefisso + "0", out);
    codici(t->dx, prefisso + "1", out);
}

void libera(Nodo* t) {
    if (t == nullptr) return;
    libera(t->sx);
    libera(t->dx);
    delete t;
}

int main() {
    // l'esempio del Cormen: frequenze in migliaia di caratteri
    vector<pair<char, int>> freq = {{'a', 45}, {'b', 13}, {'c', 12}, {'d', 16}, {'e', 9}, {'f', 5}};
    Nodo* radice = huffman(freq);
    vector<pair<char, string>> cod;
    codici(radice, "", cod);

    int bit = 0;
    for (auto [c, s] : cod) {
        int f = 0;
        for (auto [c2, f2] : freq)
            if (c2 == c) f = f2;
        cout << c << "  freq " << f << "  codice " << s << '\n';
        bit += f * (int)s.size();
    }
    cout << "Bit totali: " << bit << " (con 3 bit fissi per carattere: " << 3 * radice->freq << ")\n";
    libera(radice);
    return 0;
}
