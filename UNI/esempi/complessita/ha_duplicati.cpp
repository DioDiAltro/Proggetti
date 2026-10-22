// Controlla se un array contiene due elementi uguali confrontando ogni
// coppia (i, j) con i < j. Appena trova una coppia uguale si ferma:
// il numero di confronti dipende da COME è fatto l'input, non solo da n.
#include <iostream>
#include <vector>
using namespace std;

long long confronti = 0;

//@region dup
bool haDuplicati(const vector<int>& a) {
    int n = a.size();
    for (int i = 0; i < n; i++) {               //@outer
        for (int j = i + 1; j < n; j++) {       //@inner
            confronti++;
            if (a[i] == a[j]) {                 //@cmp
                return true;                    //@found
            }
        }
    }
    return false;                               //@none
}
//@endregion

void prova(const vector<int>& a) {
    confronti = 0;
    bool r = haDuplicati(a);
    cout << (r ? "si'" : "no") << " dopo " << confronti << " confronti\n";
}

int main() {
    prova({4, 4, 1, 7, 2, 9});      // caso migliore: i primi due sono uguali -> 1 confronto
    prova({4, 1, 7, 2, 9, 6});      // caso peggiore: tutti diversi -> 6*5/2 = 15 confronti
    prova({4, 1, 7, 2, 9, 9});      // uguali in fondo: è l'ultima coppia, servono tutti i 15 confronti
    return 0;
}
