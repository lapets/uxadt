----------------------------------------------------------------
--
-- UXADT
-- 
-- Text/UXADT.hs
--   Universal (cross-language) extensible representation for
--   algebraic data type instances.

----------------------------------------------------------------
-- 

module Text.UXADT
  where

import Data.String.Utils (join)

----------------------------------------------------------------
-- Data type definition.

type Variable = String
type Constructor = String

data UXADT =
    I Int
  | D Double
  | S String
  | V Variable
  | C Constructor [UXADT]
  deriving  (Eq)

class ToUXADT a where
  uxadt :: a -> UXADT

----------------------------------------------------------------
-- Conversion to Javascript in ASCII string representation.

instance Show UXADT where
  show u = to "" u where
    to ind u = case u of
      I i  -> show i
      D d  -> show d
      S s  -> "\"" ++ s ++ "\""
      V v -> "uxadt.V(\"" ++ v ++ "\")"
      C c us -> "uxadt.C(\"" ++ c ++ "\", [" ++ join ", " [show u | u <- us] ++ "])"

----------------------------------------------------------------
-- Other useful functions.

--eof
