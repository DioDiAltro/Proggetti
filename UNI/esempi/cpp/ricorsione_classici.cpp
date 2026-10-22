// Quattro ricorsioni classiche: somma di un array, potenza veloce,
// ricerca binaria, torri di Hanoi.
#include <iostream>
#include <vector>
using namespace std;

//@region somma
// somma di a[0..n-1]          T(n) = T(n-1) + O(1)  ->  O(n)
int somma(const vector<int>& a, int n) {
    if (n == 0) return 0;                       // nessun elemento
    return somma(a, n - 1) + a[n - 1];          // i primi n-1, più l'ultimo
}
//@endregion

//@region potenza
// x elevato alla n, con n >= 0     T(n) = T(n/2) + O(1)  ->  O(log n)
long long potenza(long long x, int n) {
    if (n == 0) return 1;
    long long m = potenza(x, n / 2);            // UNA chiamata, il risultato si usa due volte
    if (n % 2 == 0) return m * m;
    return m * m * x;
}
//@endregion

//@region ricerca
// cerca x in a[lo..hi], ordinato   T(n) = T(n/2) + O(1)  ->  O(log n)
int ricercaBinaria(const vector<int>& a, int x, int lo, int hi) {
    if (lo > hi) return -1;                     // intervallo vuoto: x non c'è
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == x) return mid;
    if (x < a[mid]) return ricercaBinaria(a, x, lo, mid - 1);
    return ricercaBinaria(a, x, mid + 1, hi);
}
//@endregion

//@region hanoi
// sposta n dischi dal piolo da al piolo a     T(n) = 2T(n-1) + O(1)  ->  2^n - 1 mosse
void hanoi(int n, char da, char a, char via) {
    if (n == 0) return;
    hanoi(n - 1, da, via, a);                   // sposta gli n-1 dischi piccoli su via
    cout << "disco " << n << ": " << da << " -> " << a << '\n';
    hanoi(n - 1, via, a, da);                   // e poi sopra il disco n
}
//@endregion

int main() {
    vector<int> v = {3, 8, 1, 6, 2};
    cout << "somma = " << somma(v, v.size()) << '\n';
    cout << "2^10 = " << potenza(2, 10) << ", 3^13 = " << potenza(3, 13) << '\n';
    vector<int> ord = {1, 3, 4, 7, 9, 12, 15};
    int ultimo = ord.size() - 1;
    cout << "ricerca di 9: indice " << ricercaBinaria(ord, 9, 0, ultimo)
         << ", ricerca di 5: " << ricercaBinaria(ord, 5, 0, ultimo) << '\n';
    hanoi(3, 'A', 'C', 'B');
    return 0;
}
