// Albero binario di ricerca (BST): ricerca, minimo e massimo, inserimento,
// cancellazione, successore, visita simmetrica e controllo della proprietà.
// Chiavi tutte diverse.
#include <climits>
#include <iostream>
#include <string>
using namespace std;

struct Nodo {
    int key;
    Nodo* left;
    Nodo* right;
    Nodo(int k) : key(k), left(nullptr), right(nullptr) {}
};

//@region cerca
// Il nodo con chiave k (nullptr se non c'è).
Nodo* cerca(Nodo* t, int k) {
    while (t != nullptr && k != t->key) {   //@s-loop
        if (k < t->key)                     //@s-cmp
            t = t->left;                    //@s-left
        else
            t = t->right;                   //@s-right
    }
    return t;                               //@s-ret
}
//@endregion

//@region minmax
Nodo* minimo(Nodo* t) {          // t != nullptr
    while (t->left != nullptr)   // sempre a sinistra
        t = t->left;
    return t;
}

Nodo* massimo(Nodo* t) {         // t != nullptr
    while (t->right != nullptr)  // sempre a destra
        t = t->right;
    return t;
}
//@endregion

//@region inserisci
// Restituisce la radice del sottoalbero t
// dopo l'inserimento di k.
Nodo* inserisci(Nodo* t, int k) {
    if (t == nullptr) return new Nodo(k);   //@i-null
    if (k < t->key)                         //@i-cmp-l
        t->left = inserisci(t->left, k);    //@i-left
    else if (k > t->key)                    //@i-cmp-r
        t->right = inserisci(t->right, k);  //@i-right
    return t;  // se k c'era già, non cambia nulla   //@i-ret
}
//@endregion

//@region cancella
// Toglie k dal sottoalbero t e ne restituisce
// la nuova radice.
Nodo* cancella(Nodo* t, int k) {
    if (t == nullptr) return nullptr;       //@d-null
    if (k < t->key) {                       //@d-cmp-l
        t->left = cancella(t->left, k);     //@d-left
    } else if (k > t->key) {                //@d-cmp-r
        t->right = cancella(t->right, k);   //@d-right
    } else if (t->left == nullptr) {        //@d-noleft
        Nodo* r = t->right;  // può essere nullptr   //@d-r
        delete t;                           //@d-del-r
        return r;                           //@d-ret-r
    } else if (t->right == nullptr) {       //@d-noright
        Nodo* l = t->left;                  //@d-l
        delete t;                           //@d-del-l
        return l;                           //@d-ret-l
    } else {                    // due figli
        Nodo* s = minimo(t->right);         //@d-succ
        t->key = s->key;                    //@d-copy
        t->right = cancella(t->right, s->key);  //@d-rec
    }
    return t;                               //@d-ret
}
//@endregion

//@region successore
// Il nodo con la più piccola chiave maggiore di k
// (nullptr se non c'è). Va bene anche se k non è
// nell'albero.
Nodo* successore(Nodo* t, int k) {
    Nodo* cand = nullptr;
    while (t != nullptr) {
        if (k < t->key) {
            cand = t;        // va bene, ma a sinistra
            t = t->left;     // può esserci di meglio
        } else {
            t = t->right;    // t->key <= k: più a destra
        }
    }
    return cand;
}
//@endregion

//@region inorder
void inorder(Nodo* t) {   // chiavi in ordine crescente
    if (t == nullptr) return;
    inorder(t->left);
    cout << t->key << ' ';
    inorder(t->right);
}
//@endregion

//@region ebst
// Vero se tutte le chiavi del sottoalbero t stanno
// strettamente tra lo e hi, e così via in giù.
bool eBST(Nodo* t, long long lo, long long hi) {
    if (t == nullptr) return true;
    if (t->key <= lo || t->key >= hi) return false;
    return eBST(t->left, lo, t->key) &&
           eBST(t->right, t->key, hi);
}
// Per tutto l'albero: eBST(radice, LLONG_MIN, LLONG_MAX)
//@endregion

void preorder(Nodo* t) {  // mostra la forma dell'albero
    if (t == nullptr) return;
    cout << t->key << ' ';
    preorder(t->left);
    preorder(t->right);
}

void distruggi(Nodo* t) {
    if (t == nullptr) return;
    distruggi(t->left);
    distruggi(t->right);
    delete t;
}

int main() {
    Nodo* radice = nullptr;
    for (int k : {50, 30, 70, 20, 40, 60, 80, 35, 45, 65})
        radice = inserisci(radice, k);

    cout << "simmetrica: ";
    inorder(radice);
    cout << "\npreordine:  ";
    preorder(radice);
    cout << "\nminimo " << minimo(radice)->key << ", massimo " << massimo(radice)->key << '\n';
    cout << "è un BST? " << (eBST(radice, LLONG_MIN, LLONG_MAX) ? "sì" : "no") << '\n';

    for (int k : {45, 55})
        cout << "cerca(" << k << "): " << (cerca(radice, k) != nullptr ? "trovata" : "assente") << '\n';
    for (int k : {45, 50, 55, 80}) {
        Nodo* s = successore(radice, k);
        cout << "successore di " << k << ": " << (s != nullptr ? to_string(s->key) : "nessuno") << '\n';
    }

    radice = inserisci(radice, 55);
    cout << "dopo inserisci(55), preordine: ";
    preorder(radice);
    cout << '\n';

    // 20 è una foglia; poi 30 ha solo il figlio destro;
    // poi 50, la radice, ha due figli (il successore è 55).
    for (int k : {20, 30, 50}) {
        radice = cancella(radice, k);
        cout << "dopo cancella(" << k << "), preordine: ";
        preorder(radice);
        cout << '\n';
    }
    cout << "simmetrica finale: ";
    inorder(radice);
    cout << '\n';

    // Un albero che rispetta la regola solo tra padre e figlio:
    // 12 è a destra di 5, ma sta nel sottoalbero sinistro di 10.
    Nodo* sbagliato = new Nodo(10);
    sbagliato->left = new Nodo(5);
    sbagliato->left->right = new Nodo(12);
    cout << "10 -> 5 -> 12 è un BST? " << (eBST(sbagliato, LLONG_MIN, LLONG_MAX) ? "sì" : "no") << '\n';
    distruggi(sbagliato);

    distruggi(radice);
    return 0;
}
