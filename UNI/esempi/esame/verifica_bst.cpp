// Esercizio: verifica se un albero binario è un albero binario di ricerca.
// Non basta controllare ogni nodo con i suoi due figli: ogni chiave deve
// stare nell'intervallo (minimo, massimo) imposto da TUTTI i suoi antenati.
#include <climits>
#include <iostream>
using namespace std;

struct Nodo {
    int val;
    Nodo* left;
    Nodo* right;
};

//@region soluzione
bool eBST(const Nodo* t, long long lo, long long hi) {
    if (t == nullptr) return true;
    if (t->val <= lo || t->val >= hi) return false;
    return eBST(t->left, lo, t->val) && eBST(t->right, t->val, hi);
}

bool eBST(const Nodo* t) {
    return eBST(t, LLONG_MIN, LLONG_MAX);
}
//@endregion

Nodo* nodo(int v, Nodo* l = nullptr, Nodo* r = nullptr) { return new Nodo{v, l, r}; }

void libera(Nodo* t) {
    if (t == nullptr) return;
    libera(t->left);
    libera(t->right);
    delete t;
}

int main() {
    /*        8                8
            /   \            /   \
           3     10         3     10
          / \      \       / \
         1   6      14    1   9      <- 9 è maggiore di 8: non può stare a sinistra di 8
    */
    Nodo* buono = nodo(8, nodo(3, nodo(1), nodo(6)), nodo(10, nullptr, nodo(14)));
    Nodo* cattivo = nodo(8, nodo(3, nodo(1), nodo(9)), nodo(10));
    cout << "primo albero:   " << (eBST(buono) ? "BST" : "non BST") << '\n';
    cout << "secondo albero: " << (eBST(cattivo) ? "BST" : "non BST") << '\n';
    libera(buono);
    libera(cattivo);
    return 0;
}
